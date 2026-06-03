from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAdminUser, AllowAny
from rest_framework.parsers import JSONParser, FormParser, MultiPartParser
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from rest_framework_simplejwt.views import TokenObtainPairView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import F, Sum, Count, Q
from django.contrib.postgres.search import SearchQuery, SearchRank
from django.contrib.auth.models import User
from .models import Category, NewsArticle, NewsSource, UserProfile
from .serializers import (
    CategorySerializer,
    NewsArticleListSerializer,
    NewsArticleSerializer,
    NewsSourceSerializer,
    SuperAdminTokenObtainPairSerializer,
    UserRegistrationSerializer,
    AdminUserSerializer,
    AdminUserCreateSerializer,
    AdminUserUpdateSerializer,
)


# ── Auth views ────────────────────────────────────────────────────────────────

class UserTokenObtainPairView(TokenObtainPairView):
    """JWT login for any active user (non-admin included)."""
    # Uses the default TokenObtainPairSerializer — no extra restrictions.
    pass


class SuperAdminTokenObtainPairView(TokenObtainPairView):
    """JWT login restricted to superuser accounts."""
    serializer_class = SuperAdminTokenObtainPairSerializer


class RegisterView(APIView):
    """Public endpoint — create a regular (non-admin) user account."""
    permission_classes = [AllowAny]
    authentication_classes = []  # no auth required

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {"message": "Account created successfully.", "username": user.username},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ── Search infrastructure ─────────────────────────────────────────────────────

class NewsPagination(PageNumberPagination):
    """Allow the client to request a page size (e.g. ?page_size=5 for typeahead)."""
    page_size_query_param = "page_size"
    max_page_size = 50


class FullTextSearchFilter(filters.BaseFilterBackend):
    """
    Ranked PostgreSQL full-text search on the precomputed `search_vector`
    (GIN-indexed), with a title substring fallback for partial words.

    Triggered by ?search=<term>. Results are ordered by relevance (rank),
    then recency. `websearch` syntax supports "quoted phrases", OR and
    -excluded terms. Runs last so its ordering wins over the default.
    """
    search_param = "search"

    def filter_queryset(self, request, queryset, view):
        term = request.query_params.get(self.search_param, "").strip()
        if not term:
            return queryset
        query = SearchQuery(term, search_type="websearch", config="english")
        return (
            queryset
            .annotate(rank=SearchRank(F("search_vector"), query))
            .filter(Q(search_vector=query) | Q(title__icontains=term))
            .order_by("-rank", "-published_at")
        )


# ── Category resource ─────────────────────────────────────────────────────────

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.order_by("name")
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name"]
    ordering_fields = ["name", "created_at"]

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdminUser()]
        return super().get_permissions()


# ── News Article resource ─────────────────────────────────────────────────────

class NewsArticleViewSet(viewsets.ModelViewSet):
    """
    Full CRUD for news articles.

    Public endpoints (GET only):
        GET  /api/news/             — paginated list of published articles
        GET  /api/news/{slug}/      — article detail
        GET  /api/news/latest/      — 10 most-recently published
        GET  /api/news/trending/    — 10 highest view-count articles
        POST /api/news/{slug}/increment_view/

    Admin-only (requires superuser JWT):
        POST   /api/news/
        PATCH  /api/news/{slug}/
        PUT    /api/news/{slug}/
        DELETE /api/news/{slug}/   — soft delete
    """

    # Explicit queryset sentinel so DRF router can derive basename automatically
    # (get_queryset() overrides this at request time).
    queryset = NewsArticle.objects.none()

    serializer_class = NewsArticleSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes = [JSONParser, FormParser, MultiPartParser]
    pagination_class = NewsPagination
    # OrderingFilter first, then FullTextSearchFilter last so relevance ranking
    # wins over the default ordering when a search term is present.
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, FullTextSearchFilter]
    filterset_fields = ["category__slug", "status", "is_external"]
    ordering_fields = ["published_at", "view_count", "title", "created_at"]
    ordering = ["-published_at"]

    # Use slug as the URL identifier — more readable and already indexed
    lookup_field = "slug"

    # ── Permissions ──────────────────────────────────────────────────────────

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdminUser()]
        return super().get_permissions()

    # ── Serializer selection ─────────────────────────────────────────────────

    def get_serializer_class(self):
        """Use the lightweight list serializer (no `content` field) for list views."""
        if self.action in ["list", "latest", "trending"]:
            return NewsArticleListSerializer
        return NewsArticleSerializer

    # ── Queryset ──────────────────────────────────────────────────────────────

    def get_queryset(self):
        # Guard for DRF schema-generation tools (swagger, etc.)
        if getattr(self, "swagger_fake_view", False):
            return NewsArticle.objects.none()

        qs = (
            NewsArticle.objects
            .select_related("author", "category")
            .filter(deleted_at__isnull=True)
        )

        # Defer the heavy `content` column on list-style actions
        if self.action in ["list", "latest", "trending"]:
            qs = qs.defer("content", "updated_at", "deleted_at")

        # Non-staff users only see published articles
        if not (self.request.user.is_authenticated and self.request.user.is_staff):
            qs = qs.filter(status="published")

        return qs

    # ── Write helpers ─────────────────────────────────────────────────────────

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    # ── Custom actions ────────────────────────────────────────────────────────

    @action(detail=False, methods=["get"], url_path="latest")
    def latest(self, request):
        """Return the 10 most-recently published articles."""
        qs = self.get_queryset().filter(status="published").order_by("-published_at")[:10]
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="trending")
    def trending(self, request):
        """Return the 10 'hottest' articles — a time-decayed blend of views and
        recency, so a brand-new story can trend without needing many views yet.

            hot = (views + 1) / (age_in_hours + 2) ** 1.3

        Scored in Python over the 60 most-recent published articles (cheap, and
        keeps the list current instead of dominated by old high-view items).
        """
        from django.utils import timezone as _tz
        now = _tz.now()
        candidates = list(
            self.get_queryset()
            .filter(status="published", published_at__isnull=False)
            .order_by("-published_at")[:60]
        )

        def hot(a):
            age_h = max((now - a.published_at).total_seconds() / 3600, 0)
            return (a.view_count + 1) / ((age_h + 2) ** 1.3)

        candidates.sort(key=hot, reverse=True)
        serializer = self.get_serializer(candidates[:10], many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="increment_view", permission_classes=[AllowAny])
    def increment_view(self, request, slug=None):
        """Atomically increment the view counter. No race condition via F() expression."""
        updated = NewsArticle.objects.filter(
            slug=slug, deleted_at__isnull=True
        ).update(view_count=F("view_count") + 1)

        if not updated:
            return Response(
                {"detail": "Article not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        new_count = (
            NewsArticle.objects
            .filter(slug=slug)
            .values_list("view_count", flat=True)
            .first()
        )
        return Response({"view_count": new_count or 0}, status=status.HTTP_200_OK)


# ── News Source resource (external API providers) ─────────────────────────────

class NewsSourceViewSet(viewsets.ModelViewSet):
    """
    Public read of active sources; admin-only create/update/delete.
        GET    /api/sources/
        POST   /api/sources/          (admin)
        PATCH  /api/sources/{id}/     (admin)
        DELETE /api/sources/{id}/     (admin)
    """
    queryset = NewsSource.objects.all().order_by("name")
    serializer_class = NewsSourceSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "website"]
    ordering_fields = ["name", "created_at"]

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdminUser()]
        return super().get_permissions()


# ── Admin: user / reporter management ─────────────────────────────────────────

class AdminUserViewSet(viewsets.ModelViewSet):
    """
    Admin-only management of user/reporter/admin accounts.
        GET    /api/admin/users/
        POST   /api/admin/users/          create reporter/admin
        PATCH  /api/admin/users/{id}/     change role / active status
        DELETE /api/admin/users/{id}/     remove account
    """
    queryset = (
        User.objects
        .select_related("profile")
        .all()
        .order_by("-date_joined")
    )
    permission_classes = [IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["username", "email", "first_name", "last_name"]
    ordering_fields = ["date_joined", "username", "last_login"]

    def get_serializer_class(self):
        if self.action == "create":
            return AdminUserCreateSerializer
        if self.action in ["update", "partial_update"]:
            return AdminUserUpdateSerializer
        return AdminUserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(AdminUserSerializer(user).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(AdminUserSerializer(user).data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Safety rails: never let an admin delete themselves or the last superuser.
        if instance == request.user:
            return Response(
                {"detail": "You cannot delete your own account."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if instance.is_superuser and User.objects.filter(is_superuser=True).count() <= 1:
            return Response(
                {"detail": "Cannot delete the last remaining superuser."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().destroy(request, *args, **kwargs)


# ── Admin: dashboard statistics ───────────────────────────────────────────────

class AdminStatsView(APIView):
    """Aggregated numbers for the admin dashboard overview (admin-only)."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        from django.utils import timezone
        from datetime import timedelta
        from django.core.cache import cache
        from .classify import classify

        # Cached for 60s and invalidated on any article change (see signals.py),
        # so the per-article classification scan doesn't run on every dashboard load.
        cached = cache.get("admin_stats")
        if cached is not None:
            return Response(cached)

        live = NewsArticle.objects.filter(deleted_at__isnull=True)
        published = live.filter(status="published")
        now = timezone.now()

        status_counts = {
            row["status"]: row["n"]
            for row in live.values("status").annotate(n=Count("id"))
        }
        top_articles = list(
            published.order_by("-view_count")[:5]
            .values("id", "title", "slug", "view_count")
        )

        # ── Distribution: articles per category / source ──────────────────────
        by_category = list(
            published.values("category__name")
            .annotate(count=Count("id")).order_by("-count")
        )
        category_breakdown = [
            {"name": r["category__name"] or "Uncategorised", "count": r["count"]}
            for r in by_category
        ]
        by_source = list(
            published.values("source__name")
            .annotate(count=Count("id")).order_by("-count")[:6]
        )
        source_breakdown = [
            {"name": r["source__name"] or "Local / CMS", "count": r["count"]}
            for r in by_source
        ]

        # ── Freshness ─────────────────────────────────────────────────────────
        recent_24h = published.filter(published_at__gte=now - timedelta(days=1)).count()
        recent_7d  = published.filter(published_at__gte=now - timedelta(days=7)).count()

        # ── Classification: content type + sensitivity (keyword model) ─────────
        type_counts, sensitivity_counts = {}, {"none": 0, "medium": 0, "high": 0}
        sensitive_examples = []
        for a in published.values("id", "title", "summary", "slug"):
            r = classify(f"{a['title']} {a['summary']}")
            type_counts[r["type"]] = type_counts.get(r["type"], 0) + 1
            sensitivity_counts[r["sensitivity"]] += 1
            if r["sensitivity"] == "high" and len(sensitive_examples) < 5:
                sensitive_examples.append({"title": a["title"], "slug": a["slug"]})
        type_breakdown = sorted(
            ({"type": k, "count": v} for k, v in type_counts.items()),
            key=lambda x: -x["count"],
        )

        payload = {
            "total_articles":   live.count(),
            "published":        status_counts.get("published", 0),
            "drafts":           status_counts.get("draft", 0),
            "archived":         status_counts.get("archived", 0),
            "total_views":      live.aggregate(v=Sum("view_count"))["v"] or 0,
            "total_categories": Category.objects.count(),
            "total_sources":    NewsSource.objects.count(),
            "total_users":      User.objects.count(),
            "staff_users":      User.objects.filter(is_staff=True).count(),
            "top_articles":     top_articles,
            # analytics
            "recent_24h":          recent_24h,
            "recent_7d":           recent_7d,
            "category_breakdown":  category_breakdown,
            "source_breakdown":    source_breakdown,
            "type_breakdown":      type_breakdown,
            "sensitivity":         sensitivity_counts,
            "sensitive_count":     sensitivity_counts["medium"] + sensitivity_counts["high"],
            "sensitive_examples":  sensitive_examples,
        }
        cache.set("admin_stats", payload, 60)
        return Response(payload)


class ImportNewsView(APIView):
    """Admin-only: run the aggregation pipeline on demand (POST /api/admin/import-news/)."""
    permission_classes = [IsAdminUser]

    def post(self, request):
        from django.core.management import call_command
        from io import StringIO

        source = request.data.get("source") or None
        limit = int(request.data.get("limit") or 20)
        before = NewsArticle.objects.count()
        out = StringIO()
        try:
            kwargs = {"limit": limit, "stdout": out}
            if source:
                kwargs["source"] = source
            call_command("import_news", **kwargs)
        except Exception as exc:  # noqa: BLE001
            return Response({"detail": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        imported = NewsArticle.objects.count() - before
        return Response({"imported": imported, "log": out.getvalue().strip()})
