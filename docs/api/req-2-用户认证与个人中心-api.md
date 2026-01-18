# API Contract for REQ-2 - 用户认证与个人中心

> Auto-generated contract based on requirement ID mapping.

## REQ-2-1 用户登录

**Description**: 用户通过账号密码或扫码方式登录系统。 支持用户名、邮箱、手机号作为登录账号。 连续登录失败3次或特定错误码触发图形验证码。 支持短信验证码二次验证（可选流程）。...

### API Specification

- **Method**: `POST`
- **Endpoint**: `/api/v1/login`
- **Summary**: 用户登录 (Login)
- **Request Model**: `UserLogin`
- **Response Model**: `Response[TokenResponse]`

**Contract Status**: ✅ Mapped to Existing Backend

---

### REQ-2-1-1 登录表单

**Description**: 包含用户名、密码输入框，以及“登录”按钮。 输入框带图标前缀。 密码输入框不支持明文显示切换。 包含“注册12306账号”和“忘记密码”链接。...

---

### REQ-2-1-2 短信验证码弹窗

**Description**: 弹窗要求输入证件号后4位和短信验证码。 提供“获取验证码”按钮，带60秒倒计时。...

### API Specification

- **Method**: `POST`
- **Endpoint**: `/api/v1/login/verify-code`
- **Summary**: 发送验证码 (Send Verify Code)
- **Request Model**: `VerifyCodeRequest`
- **Response Model**: `Response`

**Contract Status**: ✅ Mapped to Existing Backend

---

## REQ-2-2 用户注册

**Description**: 新用户填写详细信息注册账号。 注册成功后自动分配“user”角色，并创建默认乘车人记录。...

### API Specification

- **Method**: `POST`
- **Endpoint**: `/api/v1/register`
- **Summary**: 用户注册 (Register)
- **Request Model**: `UserRegister`
- **Response Model**: `Response[UserResponse]`

**Contract Status**: ✅ Mapped to Existing Backend

---

### REQ-2-2-1 账户信息输入

**Description**: - **用户名**: 必填，6-30位字母、数字或“_”，字母开头。不可修改。 - **密码**: 必填，6-20位，必须包含字母和数字。 - **确认密码**: 必须与密码一致。 - **密码强度条...

---

### REQ-2-2-2 个人信息输入

**Description**: - **证件类型**: 下拉选择（居民身份证、港澳居民居住证、台湾居民居住证、护照等）。 - **姓名**: 必填，2-20位中文。 - **证件号码**: 必填，根据证件类型正则校验（身份证18位）...

---

### REQ-2-2-3 联系方式输入

**Description**: - **邮箱**: 必填，Email格式校验。 - **手机号**: 必填，支持区号选择（+86, +852, +853, +886），默认+86。...

---

## REQ-2-3 找回密码

**Description**: 通过验证身份信息重置密码。 目前实现为模拟发送重置链接。...

### API Specification

- **Method**: `POST`
- **Endpoint**: `/api/v1/auth/password/recovery/reset`
- **Summary**: 重置密码 (Reset Password)
- **Request Model**: `PasswordResetRequest`
- **Response Model**: `Response`

**Contract Status**: ✅ Mapped to Existing Backend

---

## REQ-2-4 个人信息管理

**Description**: 用户登录后查看和修改个人资料。 分为“基本信息”、“联系方式”、“附加信息”三个模块。 支持查看模式和编辑模式切换。...

### API Specification

- **Method**: `GET`
- **Endpoint**: `/api/v1/users/profile`
- **Summary**: 获取个人信息 (Get Profile)
- **Response Model**: `Response[UserResponse]`

**Contract Status**: ✅ Mapped to Existing Backend

---

### REQ-2-4-1 基本信息模块

**Description**: **展示**: 用户名、姓名、国家/地区（固定中国）、证件类型、证件号码（脱敏显示）、核验状态。 **编辑**: 仅允许修改“姓名”（real_name）。用户名、证件信息不可修改。...

---

### REQ-2-4-2 联系方式模块

**Description**: **展示**: 手机号（脱敏）、邮箱。显示“已通过核验”状态。 **编辑**: 允许修改手机号和邮箱。修改手机号会有提示“(修改后需重新核验)”。...

---

### REQ-2-4-3 附加信息模块

**Description**: **展示**: 优惠(待)类型。 **编辑**: 下拉选择（成人/儿童/学生/残疾军人）。...

---

## REQ-2-5 退出登录

**Description**: 清除本地 Token 和用户状态。 调用后端 Logout 接口（可选，因JWT无状态）。 跳转回首页或登录页。 用户点击导航栏下拉菜单中的“退出登录”按钮触发。...

### API Specification

- **Method**: `POST`
- **Endpoint**: `/api/v1/logout`
- **Summary**: 退出登录 (Logout)
- **Response Model**: `Response`

**Contract Status**: ✅ Mapped to Existing Backend

---

## REQ-2-6 导航栏用户状态

**Description**: 全局 Header 组件根据 `userStore.isAuthenticated` 状态切换显示。...

### API Specification

- **Method**: `POST`
- **Endpoint**: `/api/v1/refresh`
- **Summary**: 刷新令牌 (Refresh Token)
- **Response Model**: `Response[TokenResponse]`

**Contract Status**: ✅ Mapped to Existing Backend

---

### REQ-2-6-1 未登录状态

**Description**: 显示“登录”和“注册”链接。...

---

### REQ-2-6-2 已登录状态

**Description**: 显示“欢迎您，[用户名]” 或 “[姓名]”。 提供“我的12306”下拉菜单，包含“火车票订单”、“本人车票”、“我的餐饮”、“我的保险”、“个人中心”、“账户安全”、“退出登录”等选项。...

---

## REQ-2-7 登录注册数据库落地

**Description**: 登录与注册接口接入 PostgreSQL 数据库，使用 SQLAlchemy 读写用户表。 注册时将用户信息写入 users 表，密码以哈希形式存储，禁止明文保存。 注册需保证 username 与 ...

---

## REQ-2-8 个人信息数据库落地与登录态联动

**Description**: 个人信息页面的展示与编辑基于 PostgreSQL 中的 users 表，而非内存中的 demo 数据。 用户登录成功后，后端登录接口返回携带用户名信息的 Token，前端持久化并在后续请求中作为 A...

---

