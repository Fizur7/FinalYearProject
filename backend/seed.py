# Seeding is now automatic on server startup via _seed_defaults() in main.py
# No manual seeding needed. Just run:
#   uvicorn app.main:app --reload --port 8000
print("Seeding is automatic. Start the server instead.")
