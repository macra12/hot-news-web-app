from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import Category, NewsArticle, Tag, NewsSource, UserProfile


# ── User auth ─────────────────────────────────────────────────────────────────

class UserRegistrationSerializer(serializers.Serializer):
    username   = serializers.CharField(max_length=150)
    email      = serializers.EmailField()
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True, default="")
    last_name  = serializers.CharField(max_length=150, required=False, allow_blank=True, default="")
    password   = serializers.CharField(min_length=8, write_only=True)

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value.lower()

    def validate_password(self, value):
        # Run Django's built-in password validators (length, common, numeric, etc.)
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
        )


class SuperAdminTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user

        if not user.is_active:
            raise AuthenticationFailed("Account is inactive.")
        if not user.is_superuser:
            raise AuthenticationFailed("Superadmin access required.")

        # Ensure is_staff is set so DRF's IsAdminUser permission passes
        if not user.is_staff:
            user.is_staff = True
            user.save(update_fields=["is_staff"])

        data["user"] = {
            "id":           user.id,
            "username":     user.username,
            "email":        user.email,
            "is_superuser": user.is_superuser,
            "is_staff":     user.is_staff,
        }
        return data


# ── Category ──────────────────────────────────────────────────────────────────

class CategorySerializer(serializers.ModelSerializer):
    article_count = serializers.IntegerField(source="articles.count", read_only=True)

    class Meta:
        model  = Category
        fields = ["id", "name", "slug", "description", "icon",
                  "display_order", "article_count", "created_at"]
        read_only_fields = ["slug", "created_at"]


# ── Tag ───────────────────────────────────────────────────────────────────────

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Tag
        fields = ["id", "name", "slug", "created_at"]
        read_only_fields = ["slug", "created_at"]


# ── News Source (external API providers) ──────────────────────────────────────

class NewsSourceSerializer(serializers.ModelSerializer):
    article_count = serializers.IntegerField(source="articles.count", read_only=True)

    class Meta:
        model  = NewsSource
        fields = ["id", "name", "slug", "website", "api_endpoint",
                  "is_external", "is_active", "article_count", "created_at"]
        read_only_fields = ["slug", "created_at"]


# ── Shared image resolver ─────────────────────────────────────────────────────

def resolve_display_image(obj, context):
    """Return an absolute URL for the article's best image (upload or external)."""
    url = obj.display_image
    if not url:
        return None
    if url.startswith("http://") or url.startswith("https://"):
        return url
    request = context.get("request") if context else None
    return request.build_absolute_uri(url) if request else url


# ── News Article (list) ───────────────────────────────────────────────────────

class NewsArticleListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for list/latest/trending endpoints.
    Omits the heavy `content` field to keep response sizes small.
    """
    author   = serializers.StringRelatedField()
    category = CategorySerializer(read_only=True)
    image    = serializers.SerializerMethodField()
    source   = serializers.StringRelatedField()

    class Meta:
        model  = NewsArticle
        fields = [
            "id", "title", "slug", "summary", "image",
            "author", "category", "source", "published_at", "status",
            "is_external", "external_url",
            "view_count", "like_count", "bookmark_count", "created_at",
        ]

    def get_image(self, obj):
        return resolve_display_image(obj, self.context)


# ── News Article (detail / write) ─────────────────────────────────────────────

class NewsArticleSerializer(serializers.ModelSerializer):
    """
    Full serializer used for retrieve, create, update, and delete endpoints.
    `deleted_at` is intentionally excluded — it is an internal implementation
    detail of the soft-delete mechanism and should not be part of the public API.
    """
    author       = serializers.StringRelatedField()
    category     = CategorySerializer(read_only=True)
    category_id  = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source="category",
        write_only=True,
        required=False,
        allow_null=True,
    )
    tags         = TagSerializer(many=True, read_only=True)
    tag_ids      = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(),
        source="tags",
        many=True,
        write_only=True,
        required=False,
    )
    source       = NewsSourceSerializer(read_only=True)
    source_id    = serializers.PrimaryKeyRelatedField(
        queryset=NewsSource.objects.all(),
        source="source",
        write_only=True,
        required=False,
        allow_null=True,
    )
    image        = serializers.ImageField(required=False, allow_null=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model  = NewsArticle
        fields = [
            "id", "title", "slug", "summary", "content", "image", "image_url",
            "author", "category", "category_id",
            "tags", "tag_ids", "source", "source_id",
            "is_external", "external_url",
            "published_at", "status", "status_display",
            "view_count", "like_count", "bookmark_count",
            "created_at", "updated_at",
        ]
        read_only_fields = [
            "slug", "author", "view_count", "like_count", "bookmark_count",
            "created_at", "updated_at",
        ]

    def validate_status(self, value):
        valid = {choice[0] for choice in NewsArticle.STATUS_CHOICES}
        if value not in valid:
            raise serializers.ValidationError(
                f"Status must be one of: {', '.join(sorted(valid))}."
            )
        return value

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Present a single, ready-to-use image URL (uploaded file or external).
        data["image"] = resolve_display_image(instance, self.context)
        return data


# ── Admin: user / reporter management ─────────────────────────────────────────

class AdminUserSerializer(serializers.ModelSerializer):
    """List/read users with their profile role. Used by the admin Users panel."""
    role        = serializers.CharField(source="profile.role", read_only=True)
    article_count = serializers.IntegerField(source="articles.count", read_only=True)

    class Meta:
        model  = User
        fields = [
            "id", "username", "email", "first_name", "last_name",
            "is_active", "is_staff", "is_superuser", "role",
            "article_count", "date_joined", "last_login",
        ]
        read_only_fields = fields


class AdminUserCreateSerializer(serializers.Serializer):
    """Create a reporter/admin account from the admin panel."""
    username   = serializers.CharField(max_length=150)
    email      = serializers.EmailField(required=False, allow_blank=True, default="")
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True, default="")
    last_name  = serializers.CharField(max_length=150, required=False, allow_blank=True, default="")
    password   = serializers.CharField(min_length=8, write_only=True)
    role       = serializers.ChoiceField(
        choices=UserProfile.Role.choices, default=UserProfile.Role.REPORTER,
    )

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def create(self, validated_data):
        role = validated_data["role"]
        # Reporters and admins both need staff access to the dashboard/API.
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            is_staff=True,
            is_superuser=(role == UserProfile.Role.ADMIN),
        )
        # The post_save signal creates the profile; sync the chosen role onto it.
        profile = user.profile
        profile.role = role
        profile.save(update_fields=["role"])
        return user


class AdminUserUpdateSerializer(serializers.Serializer):
    """Update an existing user's role / active status from the admin panel."""
    role      = serializers.ChoiceField(choices=UserProfile.Role.choices, required=False)
    is_active = serializers.BooleanField(required=False)

    def update(self, instance, validated_data):
        if "is_active" in validated_data:
            instance.is_active = validated_data["is_active"]
        if "role" in validated_data:
            role = validated_data["role"]
            instance.is_staff = role in (UserProfile.Role.REPORTER, UserProfile.Role.ADMIN)
            instance.is_superuser = role == UserProfile.Role.ADMIN
            profile, _ = UserProfile.objects.get_or_create(user=instance)
            profile.role = role
            profile.save(update_fields=["role"])
        instance.save()
        return instance
