# Express API

API REST de transacciones wallet.

## Instalación

```bash
npm install
```

## Uso

```bash
npm start
npm run dev 
npm test
```

## Endpoints

- `POST /transactions` - crear transacción
- `GET /transactions?userId=1` - listar transacciones de usuario
- `PATCH /transactions/:id/approve` - aprobar transacción
- `PATCH /transactions/:id/reject` - rechazar transacción
