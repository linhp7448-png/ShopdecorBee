# BeeShop Angular Frontend

Frontend Angular cho BeeShop. Ứng dụng hiện chạy theo scope `mock-first`: dữ liệu lấy từ `src/core/mock-data`, chưa có API/backend integration thực trong frontend.

## Stack hiện tại

- Angular `21.1.x`
- Standalone components + `bootstrapApplication(...)`
- Zoneless change detection
- Signals / computed cho state
- Template-driven forms (`FormsModule`, `ngModel`)
- Tailwind utility classes qua `index.html`
- Unit test bằng `ng test` với Angular unit-test builder

## Cấu trúc chính

```text
src/
  core/
    models/
    mock-data/
  features/
    <domain>/
      components/
      data-access/
  shared/
    components/
```

Các điểm đáng chú ý:

- `src/features/search/components/search-results.component.ts` là route shell; filter chips, filter panel và results content đã được tách thành child components.
- `src/features/catalog/data-access/category-page.facade.ts` giữ state/filter của category page.
- `src/shared/components/header.component.ts` là shell; navigation, search và actions đã được tách thành child components.
- `src/core/mock-data/header-navigation.mock.ts` giữ navigation/config của header.

## Chạy local

Yêu cầu: Node.js tương thích với Angular 21 và `npm`.

```bash
npm install
npm run dev
```

App dev server chạy bằng Angular CLI (`ng serve`).

## Build

```bash
npm run build
```

Output được tạo trong `dist/`.

## Test

```bash
npm test
```

Chạy watch mode:

```bash
npm run test:watch
```

## Ghi chú quan trọng

- Frontend hiện chưa dùng `HttpClient`, repository layer, guard, interceptor hay NgRx.
- `.env.local` và `index.tsx` là dấu vết từ scaffold cũ, không phải entry/runtime chính của Angular app hiện tại.
- Nếu cần rule cho AI/code assistant, xem `AI_RULES.md`.
