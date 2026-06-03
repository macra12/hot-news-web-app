"""
API test suite for GenZFlash News backend.

Run with:
    python manage.py test api --verbosity=2

The test runner creates a temporary PostgreSQL database, runs all tests,
and drops it automatically.  The database user (postgres) must have the
CREATEDB privilege.
"""

from django.contrib.auth.models import User
from django.test import SimpleTestCase
from rest_framework import status
from rest_framework.test import APITestCase

from api.management.commands.import_news import (
    clean_image_url,
    is_cambodia_item,
    repair_mojibake,
    strip_html,
)


# ── Helpers ───────────────────────────────────────────────────────────────────

def make_superuser(username="admin", password="Admin@1234"):
    return User.objects.create_superuser(
        username=username, email=f"{username}@test.com", password=password
    )


def make_user(username="member", password="Member@1234"):
    return User.objects.create_user(
        username=username, email=f"{username}@test.com", password=password
    )


class ImportNewsHelperTests(SimpleTestCase):
    def test_repair_mojibake_restores_khmer_text(self):
        original = "កម្ពុជា"
        broken = original.encode("utf-8").decode("latin1")
        self.assertEqual(repair_mojibake(broken), original)

    def test_strip_html_decodes_entities(self):
        self.assertEqual(strip_html("<p>Phnom Penh &amp; Cambodia</p>"), "Phnom Penh & Cambodia")

    def test_clean_image_url_rejects_logo_placeholders(self):
        self.assertEqual(clean_image_url("https://example.com/logo.png"), "")
        self.assertEqual(
            clean_image_url("https://example.com/uploads/story-photo.jpg"),
            "https://example.com/uploads/story-photo.jpg",
        )

    def test_cambodia_filter_rejects_unrelated_country_story(self):
        self.assertTrue(is_cambodia_item({
            "title": "Phnom Penh launches new public bus route",
            "summary": "Cambodian commuters get more choices.",
            "content": "",
            "link": "https://example.com/story",
        }))
        self.assertFalse(is_cambodia_item({
            "title": "India tech stocks rally",
            "summary": "Markets rose in Mumbai.",
            "content": "",
            "link": "https://example.com/india",
        }))


# ── Registration ──────────────────────────────────────────────────────────────

class RegistrationTests(APITestCase):
    URL = "/api/auth/register/"

    def test_register_creates_user(self):
        res = self.client.post(self.URL, {
            "username": "newuser",
            "email":    "new@example.com",
            "password": "Secure@1234",
        }, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username="newuser").exists())
        self.assertIn("username", res.json())

    def test_register_duplicate_username_rejected(self):
        make_user("taken")
        res = self.client.post(self.URL, {
            "username": "taken",
            "email":    "other@example.com",
            "password": "Secure@1234",
        }, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("username", res.json())

    def test_register_duplicate_email_rejected(self):
        make_user("user1")
        User.objects.filter(username="user1").update(email="shared@test.com")
        res = self.client.post(self.URL, {
            "username": "user2",
            "email":    "shared@test.com",
            "password": "Secure@1234",
        }, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_short_password_rejected(self):
        res = self.client.post(self.URL, {
            "username": "shortpw",
            "email":    "short@example.com",
            "password": "123",
        }, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


# ── Authentication ────────────────────────────────────────────────────────────

class AuthTests(APITestCase):
    LOGIN_URL       = "/api/auth/login/"
    ADMIN_LOGIN_URL = "/api/auth/admin/login/"

    def setUp(self):
        self.user  = make_user()
        self.admin = make_superuser()

    def test_user_login_returns_tokens(self):
        res = self.client.post(self.LOGIN_URL, {
            "username": "member", "password": "Member@1234",
        }, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertIn("access",  data)
        self.assertIn("refresh", data)

    def test_user_login_wrong_password(self):
        res = self.client.post(self.LOGIN_URL, {
            "username": "member", "password": "wrongpassword",
        }, format="json")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_login_accepts_superuser(self):
        res = self.client.post(self.ADMIN_LOGIN_URL, {
            "username": "admin", "password": "Admin@1234",
        }, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertIn("access", data)
        self.assertIn("user",   data)
        self.assertTrue(data["user"]["is_superuser"])

    def test_admin_login_rejects_regular_user(self):
        res = self.client.post(self.ADMIN_LOGIN_URL, {
            "username": "member", "password": "Member@1234",
        }, format="json")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_token_refresh(self):
        login = self.client.post(self.LOGIN_URL, {
            "username": "member", "password": "Member@1234",
        }, format="json")
        refresh = login.json()["refresh"]
        res = self.client.post("/api/auth/refresh/", {"refresh": refresh}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("access", res.json())


# ── Category ──────────────────────────────────────────────────────────────────

class CategoryTests(APITestCase):
    LIST_URL = "/api/categories/"

    def setUp(self):
        self.admin  = make_superuser()
        self.user   = make_user()
        from api.models import Category
        self.cat = Category.objects.create(name="Sports")

    def test_list_is_public(self):
        res = self.client.get(self.LIST_URL)
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_create_requires_admin(self):
        # Anonymous
        res = self.client.post(self.LIST_URL, {"name": "Tech"}, format="json")
        self.assertIn(res.status_code, [
            status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN
        ])

    def test_create_by_regular_user_forbidden(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.post(self.LIST_URL, {"name": "Tech"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_by_admin_succeeds(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.post(self.LIST_URL, {"name": "Tech"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.json()["name"], "Tech")
        self.assertIn("slug", res.json())

    def test_delete_by_admin_succeeds(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.delete(f"{self.LIST_URL}{self.cat.id}/")
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)


# ── News Articles ─────────────────────────────────────────────────────────────

class NewsArticleTests(APITestCase):
    LIST_URL = "/api/news/"

    def setUp(self):
        from api.models import Category, NewsArticle
        self.admin = make_superuser()
        self.user  = make_user()
        self.cat   = Category.objects.create(name="World")

        self.published = NewsArticle.objects.create(
            title="Published Story",
            content="Full content here.",
            author=self.admin,
            category=self.cat,
            status="published",
        )
        self.draft = NewsArticle.objects.create(
            title="Draft Story",
            content="Draft content.",
            author=self.admin,
            category=self.cat,
            status="draft",
        )

    # ── Public read tests ──────────────────────────────────────────────────

    def test_list_returns_only_published_to_anonymous(self):
        res = self.client.get(self.LIST_URL)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        slugs = [a["slug"] for a in res.json().get("results", res.json())]
        self.assertIn(self.published.slug, slugs)
        self.assertNotIn(self.draft.slug, slugs)

    def test_list_returns_drafts_to_admin(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.get(self.LIST_URL)
        slugs = [a["slug"] for a in res.json().get("results", res.json())]
        self.assertIn(self.draft.slug, slugs)

    def test_detail_by_slug(self):
        res = self.client.get(f"{self.LIST_URL}{self.published.slug}/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.json()["title"], "Published Story")

    def test_detail_draft_hidden_from_anonymous(self):
        res = self.client.get(f"{self.LIST_URL}{self.draft.slug}/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_deleted_at_not_in_response(self):
        """deleted_at is an internal field and must not be exposed via the API."""
        self.client.force_authenticate(user=self.admin)
        res = self.client.get(f"{self.LIST_URL}{self.published.slug}/")
        self.assertNotIn("deleted_at", res.json())

    # ── Custom actions ─────────────────────────────────────────────────────

    def test_latest_action(self):
        res = self.client.get(f"{self.LIST_URL}latest/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIsInstance(res.json(), list)

    def test_trending_action(self):
        res = self.client.get(f"{self.LIST_URL}trending/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_increment_view_increases_count(self):
        res = self.client.post(
            f"{self.LIST_URL}{self.published.slug}/increment_view/"
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.json()["view_count"], 1)

    def test_increment_view_nonexistent_returns_404(self):
        res = self.client.post(f"{self.LIST_URL}no-such-slug/increment_view/")
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    # ── Write permission tests ─────────────────────────────────────────────

    def test_create_article_anonymous_fails(self):
        res = self.client.post(self.LIST_URL, {
            "title": "New", "content": "Body", "status": "draft",
        }, format="json")
        self.assertIn(res.status_code, [
            status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN
        ])

    def test_create_article_regular_user_fails(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.post(self.LIST_URL, {
            "title": "New", "content": "Body", "status": "draft",
        }, format="json")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_article_admin_succeeds(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.post(self.LIST_URL, {
            "title":   "Admin Article",
            "content": "Written by admin.",
            "status":  "draft",
        }, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        data = res.json()
        self.assertEqual(data["title"],  "Admin Article")
        self.assertEqual(data["author"], "admin")  # StringRelatedField → username

    def test_update_article_admin(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.patch(
            f"{self.LIST_URL}{self.published.slug}/",
            {"title": "Updated Title"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.json()["title"], "Updated Title")

    def test_soft_delete_article_admin(self):
        from api.models import NewsArticle
        self.client.force_authenticate(user=self.admin)
        res = self.client.delete(f"{self.LIST_URL}{self.published.slug}/")
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)

        # Article is soft-deleted — still in DB but deleted_at is set
        self.published.refresh_from_db()
        self.assertIsNotNone(self.published.deleted_at)

        # Article no longer visible via API
        res2 = self.client.get(f"{self.LIST_URL}{self.published.slug}/")
        self.assertEqual(res2.status_code, status.HTTP_404_NOT_FOUND)

    # ── Search & filter ────────────────────────────────────────────────────

    def test_search_by_title(self):
        res = self.client.get(f"{self.LIST_URL}?search=Published")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.json().get("results", res.json())
        self.assertTrue(len(results) >= 1)

    def test_filter_by_category_slug(self):
        res = self.client.get(f"{self.LIST_URL}?category__slug=world")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
