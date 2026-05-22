# Hot News App TODO - Scalable MVP (Next.js + Django + PostgreSQL)

## Backend Steps ✅/⏳/❌

- [✅] 1. Create `backend/requirements.txt` (DRF, simplejwt, corsheaders, pillow)
- [✅] 2. Edit `backend/backend/settings.py` (add apps, CORS, JWT/DRF config, media, pagination class)
- [✅] 3. Create `backend/api/serializers.py` (Category/NewsArticle serializers w/ validation)
- [✅] 4. Edit `backend/api/models.py` (Category, NewsArticle w/ ImageField, soft delete deleted_at, indexes Meta)
- [✅] 5. Edit `backend/api/admin.py` (register models)
- [✅] 6. Edit `backend/api/views.py` (ViewSets w/ filters (django-filter), pagination, IsAdminUser perm, queryset optimizations select_related/prefetch)
- [✅] 7. Create `backend/api/urls.py` (DefaultRouter)
- [✅] 8. Edit `backend/backend/urls.py` (api.urls, static/media serve)
- [✅] 9. `pip install -r backend/requirements.txt`
- [✅] 10. `makemigrations api`, `migrate`, `createsuperuser` (interactive — complete prompts)

- [✅] 11. Testserver: `python backend/manage.py runserver`, Postman APIs (/news/, /auth/login/)

## Frontend Steps

- [✅] 12. Edit `frontend/package.json` + `npm i axios react-query` (for caching/API)
- [✅] 13. Edit `frontend/src/app/page.js` (homepage: latest news grid, categories nav via react-query/fetch)

- [ ] 13. Edit `frontend/src/app/page.js` (homepage: latest news grid, categories nav via SWR/fetch)
- [ ] 14. Create `src/app/news/page.js` (news list paginated)
- [ ] 15. Create `src/app/news/[slug]/page.js` (dynamic detail SSR)
- [ ] 16. Create `src/app/category/[slug]/page.js`
- [ ] 17. Create `src/app/admin/login/page.js` (JWT login)
- [ ] 18. Create `src/app/admin/page.js` (protected CRUD forms, RBAC check)
- [ ] 19. Create components: NewsCard, CategoryList, AdminForm (Tailwind responsive)
- [ ] 20. `cd frontend && npm run dev`, test UI + API integration

## Polish & Scale

- [ ] 21. Add Django signals for slug gen/auto pub date
- [ ] 22. Frontend: JWT storage (cookies/localStorage secure), protect routes
- [ ] 23. Image upload test (Pillow handles)
- [ ] 24. Add search/filter QS (?q=, trending via view_count)
- [ ] 25. Indexes confirmed post-migrate
- [ ] 26. Optional: Redis setup for caching (django-redis)

Current step: Backend reqs/settings → Follow order, update TODO after each.

Run commands as specified after files ready.
