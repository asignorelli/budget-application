.ONESHELL:

.PHONY: setup_backend
setup_backend:
	cd backend && pip install -r requirements.txt

.PHONY: initdb
initdb:
	cd backend && python -m flask --app app initdb

.PHONY: run_backend
run_backend:
	cd backend && python app.py

.PHONY: setup_frontend
setup_frontend:
	cd frontend && npm install

.PHONY: run_frontend
run_frontend:
	cd frontend && npm run dev