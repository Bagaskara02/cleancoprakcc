# Cleanco - Service User & Order API

Backend service untuk mengelola data **pengguna (users)** dan **pesanan (orders)** pada web user.

## Struktur Folder
```
service-user-order/
├── config/
│   └── database.js        # Koneksi MySQL (Cloud SQL)
├── controllers/
│   ├── userController.js
│   └── orderController.js
├── models/
│   ├── userModel.js
│   └── orderModel.js
├── routes/
│   ├── userRoutes.js
│   └── orderRoutes.js
├── .env.example
├── .gitignore
├── cloudbuild.yaml
├── Dockerfile
├── index.js
├── package.json
└── README.md
```

## API Endpoints

### Users
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET    | `/api/v1/users` | Ambil semua user |
| GET    | `/api/v1/users/:id` | Ambil user by ID |
| POST   | `/api/v1/users` | Registrasi user baru |

### Orders
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET    | `/api/v1/orders` | Ambil semua order |
| GET    | `/api/v1/orders/user/:userId` | Ambil order by user |
| POST   | `/api/v1/orders` | Buat order baru |
| PATCH  | `/api/v1/orders/:id/status` | Update status order |

## Deploy
- **Cloud Run** via `cloudbuild.yaml`
- Database: **GCP Cloud SQL (MySQL)**
