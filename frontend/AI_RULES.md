# AI Rules For BeeShop Angular Frontend

## Mục tiêu file

File này khóa các nguyên tắc mà mọi AI/code assistant MUST tuân thủ khi sửa hoặc sinh code cho frontend Angular trong repo này.

- Phạm vi hiện tại chỉ là frontend tại `frontend/`.
- Rule ưu tiên consistency với codebase hiện có hơn là best practice chung.
- Chỉ ghi những nguyên tắc đã quan sát được từ code và tài liệu hiện tại.

## Tech stack summary

- Angular `21.1.x`
- TypeScript `5.8.x`
- RxJS `7.8.x`
- Package manager: `npm`
- Bootstrap bằng `bootstrapApplication(...)`
- Routing bằng `provideRouter(routes)`
- Change detection: `provideZonelessChangeDetection()` + `ChangeDetectionStrategy.OnPush`
- Component model: standalone component, không dùng `NgModule`
- State chính: `signal`, `computed`, `effect`
- Form hiện tại: template-driven với `FormsModule` và `[(ngModel)]`
- Styling chính: Tailwind utility classes qua runtime config trong `index.html`
- Data hiện tại: mock data trong `src/core/mock-data`
- Unit test chạy qua `ng test`

## Kiến trúc dự án

- App shell ở `src/app.component.ts`; route tập trung ở `src/app.routes.ts`.
- Cấu trúc chính theo feature-first:
  - `src/core/models`: domain models dùng chung
  - `src/core/mock-data`: mock collections và static config
  - `src/features/<domain>/components`: UI theo domain
  - `src/features/<domain>/data-access`: facade/store/helper theo domain
  - `src/shared/components`: reusable UI và app shell
- Pattern chủ đạo là `store + facade` cho shared state; một số feature nhỏ vẫn dùng facade signal-only.
- Route shell + presentational children đã được dùng rõ ở search page và header.
- Frontend hiện tại là mock-only; chưa có API layer thật, chưa có `HttpClient`, repository, guard, interceptor.

## Các rule bắt buộc

### Project structure

- Code mới theo domain MUST đặt trong `src/features/<domain>/components` hoặc `src/features/<domain>/data-access`.
- UI tái sử dụng giữa nhiều màn hình MUST đặt trong `src/shared/components`.
- Domain types dùng chung MUST đặt trong `src/core/models`.
- Mock collections và static config dùng chung MUST đặt trong `src/core/mock-data`.
- Route shell lớn SHOULD được tách thành child presentational components khi boundary đã rõ và không làm đổi behavior.

### Naming convention

- File component MUST dùng suffix `*.component.ts`.
- File facade MUST dùng suffix `*.facade.ts`.
- File store MUST dùng suffix `*.store.ts`.
- File model MUST dùng suffix `*.model.ts`.
- Cross-feature import MUST dùng alias `@/`.
- Import cùng thư mục SHOULD giữ relative path.

### Component design

- Component mới MUST là `standalone: true`.
- Component mới SHOULD dùng `ChangeDetectionStrategy.OnPush`.
- Dependency injection SHOULD ưu tiên `inject()`.
- Component SHOULD giữ local UI state bằng `signal` khi state chỉ phục vụ màn hình hiện tại.
- Route shell SHOULD giữ router/query/orchestration; child component SHOULD chỉ nhận `@Input`/`@Output`.
- Template mới SHOULD dùng inline `template` vì đây vẫn là pattern phổ biến nhất trong repo.
- `@if` và `@for` MUST được ưu tiên cho control flow mới.
- `@for` SHOULD có `track` rõ ràng.

### Service/API design

- AI MUST NOT tạo `HttpClient`, repository, API service, interceptor, hay data service mới như thể frontend đã có backend integration.
- Khi cần thêm dữ liệu mới, AI SHOULD mở rộng `core/models` và `core/mock-data` trước.
- Contract facade/store hiện có MUST được giữ ổn định để mock data có thể thay bằng API sau này mà không làm vỡ UI consumer.

### State management

- Shared feature state SHOULD nằm trong store bằng `signal`.
- Facade SHOULD expose signal từ store và expose action method cho component.
- Page-local state có lifecycle theo route SHOULD nằm trong facade/data-access riêng của page nếu component đang quá tải.
- AI MUST NOT thêm NgRx, `BehaviorSubject`, `Subject`, global event bus, hoặc global app store mới nếu chưa có yêu cầu rõ.
- Với feature nhỏ, cô lập, mock-only, facade signal-only là chấp nhận được.

### RxJS usage

- RxJS SHOULD chỉ dùng khi Angular API trả về observable, ví dụ router streams.
- Manual `Subscription` MUST được cleanup trong `ngOnDestroy`.
- `setTimeout`, `setInterval`, browser event listener, hoặc timer thủ công MUST được cleanup khi component destroy.
- AI SHOULD ưu tiên signal/computed hơn RxJS cho local state đồng bộ.

### Form handling

- Form mới SHOULD theo pattern `FormsModule` + `[(ngModel)]` + submit handler đơn giản.
- Reactive Forms MUST NOT được đưa vào khu vực hiện đang dùng template-driven forms trừ khi có yêu cầu thay đổi rõ.
- Validation SHOULD giữ ở mức nhẹ và inline, nhất quán với màn hình đang sửa.

### Routing

- Route mới MUST khai báo tập trung trong `src/app.routes.ts`.
- AI MUST NOT tự chuyển route hiện tại sang lazy loading nếu chưa được yêu cầu.
- Với màn hình có state cần share/reload/back-forward đúng, AI MUST đồng bộ state với query params theo pattern search page.
- Route path, param name, query param contract hiện có MUST NOT bị đổi nếu chưa có yêu cầu tương thích ngược rõ.

### Error handling

- Error handling hiện tại SHOULD giữ local theo component hoặc facade; repo chưa có global error layer.
- AI MUST NOT thêm global toast/error framework mới nếu chưa có yêu cầu rõ.
- Khi parse query params hoặc input không hợp lệ, AI SHOULD fail-safe và giữ UI không vỡ.

### UI / Styling

- UI mới SHOULD ưu tiên Tailwind utility classes.
- AI SHOULD tái dùng token màu đã có: `honey`, `cream`, `charcoal`.
- Inline `styles` chỉ SHOULD dùng cho animation hoặc behavior khó diễn đạt chỉ bằng utility class.
- AI MUST NOT thêm SCSS file, CSS module, hoặc styling system thứ hai.
- Shared shell lớn như header SHOULD tách phần UI con khi cần giảm độ phức tạp, nhưng không đổi visual contract.

### Reusability

- Chỉ extract shared component khi UI hoặc hành vi được tái sử dụng thực sự ở nhiều nơi hoặc đang làm rõ boundary của shell lớn.
- AI SHOULD ưu tiên tái dùng `shared/components/icon.component.ts` và các shell parts hiện có.
- Static navigation/config lớn SHOULD được tách khỏi component file và đặt ở `src/core/mock-data`.
- AI MUST NOT tạo abstraction mới chỉ để “clean architecture” nếu chưa có nhu cầu thực tế.

### Performance

- Code mới MUST tương thích với `OnPush` và zoneless change detection.
- AI SHOULD ưu tiên `signal`/`computed` cho derived state thay vì tính lặp lại trong template.
- Danh sách render bằng `@for` SHOULD có `track`.
- AI SHOULD tránh mutation khó theo dõi lên state đang expose qua signal.

### Testing

- Component standalone mới SHOULD có ít nhất 1 smoke test tạo component bằng TestBed.
- Store/facade/helper mới SHOULD có test contract cơ bản bằng `TestBed.inject(...)` hoặc pure unit test.
- Nếu thay đổi logic search/filter/query sync/cart/product lookup, AI MUST thêm behavioral test trong cùng batch.
- AI SHOULD giữ chiến lược test gọn, bám mức hiện có của repo.

### Security

- AI MUST NOT thêm `[innerHTML]` với dữ liệu động/chưa được tin cậy.
- `[innerHTML]` chỉ SHOULD dùng cho static copy đã kiểm soát.
- AI MUST NOT thêm bypass sanitizer hoặc thao tác DOM không cần thiết nếu chưa có yêu cầu rõ.
- Input/query params mới SHOULD được normalize và parse an toàn trước khi đưa vào state.

### Code review checklist

- Mọi thay đổi MUST giữ frontend scope hiện tại là mock-first trừ khi task nói khác.
- Mọi thay đổi MUST giữ route, selector, facade contract, query param contract đang public nếu chưa được yêu cầu đổi.
- Mọi import cross-feature MUST dùng `@/`.
- State dùng chung SHOULD đi qua facade/store hoặc page-level data-access, không đọc mock data lung tung trong component.
- Không thêm dependency mới nếu chưa có lý do rõ.

### Khi nào không được làm

- MUST NOT thêm `NgModule`.
- MUST NOT thêm NgRx.
- MUST NOT thêm guard, interceptor, directive, custom pipe mới như chuẩn mặc định khi repo chưa dùng các pattern đó.
- MUST NOT thêm dependency mới chỉ để giải quyết bài toán mà Angular core hiện tại đã xử lý được.
- MUST NOT đổi public route path, route param, query param, facade method, hoặc model contract đang được màn hình khác dùng.
- MUST NOT tạo abstraction/service layer thừa nếu feature hiện tại chỉ dùng mock data cục bộ.

## Các anti-pattern cần tránh

- Đưa mock data trực tiếp vào nhiều component thay vì đi qua facade/store/data-access hiện có.
- Để route shell ôm cả router/query sync lẫn toàn bộ UI lớn khi đã có seam tách child component rõ.
- Dùng relative import dài xuyên nhiều thư mục thay cho alias `@/`.
- Thêm Reactive Forms vào màn hình đang dùng `ngModel`.
- Thêm RxJS state management cho local UI state vốn đã phù hợp với signal.
- Tạo lazy route, guard, interceptor, service API giả mà không có yêu cầu sản phẩm tương ứng.
- Dùng `[innerHTML]` cho dữ liệu do người dùng nhập hoặc dữ liệu chưa kiểm soát.
- Refactor đổi structure lớn chỉ vì “đẹp hơn” nhưng không giảm coupling hoặc bug risk.

## Quy trình khi AI thêm tính năng mới

1. MUST đọc feature gần nhất đang cùng domain trước khi thêm code.
2. MUST xác định tính năng thuộc `shared`, `core`, hay `features/<domain>`.
3. Nếu cần shared state trong feature, SHOULD thêm vào store hoặc data-access trước, rồi expose qua facade.
4. Nếu chỉ là local UI state, SHOULD giữ trong component bằng `signal`.
5. Nếu cần route mới, MUST thêm vào `app.routes.ts`.
6. Nếu cần dữ liệu mới, MUST cập nhật model và mock data tương ứng trước khi sửa UI.
7. Nếu state cần share/reload/back-forward, MUST đồng bộ query params theo pattern search page.
8. SHOULD thêm test tối thiểu cho component/store/facade/helper bị ảnh hưởng.
9. MUST giữ nguyên các contract public hiện có nếu task không yêu cầu breaking change.

## Quy trình khi AI refactor

1. MUST xác định convention phổ biến nhất của khu vực đang sửa rồi refactor theo convention đó.
2. MUST giữ nguyên behavior UI, route, query params, facade API và mock data contract đang được dùng.
3. SHOULD refactor theo từng seam nhỏ: component, facade/store, helper, mock/model.
4. MUST NOT chuyển cả feature sang kiến trúc mới nếu chỉ đang sửa cục bộ.
5. Nếu phát hiện chỗ không đồng nhất, SHOULD chuẩn hóa về pattern phổ biến nhất thay vì tạo pattern thứ ba.
6. Với route shell hoặc shared shell lớn, SHOULD tách child presentational parts trước khi chạm logic state.

## Checklist trước khi commit

- Đúng phạm vi `frontend/`, không lấn sang backend nếu task không yêu cầu.
- File mới nằm đúng `core`, `features`, hoặc `shared`.
- Import cross-feature dùng `@/`.
- Không thêm dependency mới ngoài yêu cầu.
- Không thêm `NgModule`, NgRx, guard, interceptor, service API thừa.
- Component mới là standalone; ưu tiên OnPush.
- Không làm vỡ route path, query param, facade/store contract hiện có.
- Nếu sửa search/shareable state, đã kiểm tra URL sync, reload, back/forward.
- Nếu thêm timer/subscription/listener, đã cleanup đầy đủ.
- Có test tối thiểu cho logic mới hoặc component/store/helper mới.
- Nếu chạy build/test và phát sinh thay đổi cache/artifact, MUST kiểm tra trước khi commit.

## Các giả định / điểm cần xác nhận thêm

- Frontend hiện tại vẫn là mock-only; requirement API-backed search trong tương lai chưa phải runtime convention hiện hành.
- `.env.local` và `index.tsx` còn là dấu vết scaffold cũ, không phải entry/runtime chính của Angular app.
- Search page đã sync URL state; category page hiện vẫn là state local theo page facade và chưa sync URL.
- Đa số domain dùng `store + facade`, nhưng một số feature nhỏ vẫn là facade signal-only.
- Route `/admin` chưa có guard; auth hiện là mock in-memory, không phải security boundary thật.
- Chưa quan sát thấy custom pipe, directive, guard, interceptor, hoặc API service thật; AI không nên coi các pattern này là hạ tầng sẵn có.
- Build production đã pass ngày `2026-03-17`, nhưng làm thay đổi artifact trong `.angular/cache`; cần xác nhận policy commit đối với artifact này.
