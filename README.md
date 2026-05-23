# Cleanco - Service Worker & Upload API

Backend service untuk mengelola data **layanan (services)** dan **pekerja (workers)** pada web admin perusahaan.

## Struktur Folder
```
service-worker/
├── config/
│   └── database.js        # Koneksi MySQL (Cloud SQL)
├── controllers/
│   ├── serviceController.js
│   └── workerController.js
├── models/
│   ├── serviceModel.js
│   └── workerModel.js
├── routes/
│   ├── serviceRoutes.js
│   ├── workerRoutes.js
│   └── photoRoutes.js
├── .env.example
├── .gitignore
├── cloudbuild.yaml
├── Dockerfile
├── index.js
├── package.json
└── README.md
```

## API Endpoints

### Services
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET    | `/api/v2/services` | Ambil semua layanan |
| POST   | `/api/v2/services` | Tambah layanan baru |
| PUT    | `/api/v2/services/:id` | Update layanan |
| DELETE | `/api/v2/services/:id` | Hapus layanan |

### Workers
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET    | `/api/v2/workers` | Ambil semua pekerja |
| GET    | `/api/v2/workers/:id` | Ambil pekerja by ID |
| PATCH  | `/api/v2/workers/:id/status` | Update status pekerja |

### Photos
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| POST   | `/api/v2/photos/upload` | Upload foto |

## Deploy
- **Cloud Run** via `cloudbuild.yaml`
- Database: **GCP Cloud SQL (MySQL)**
