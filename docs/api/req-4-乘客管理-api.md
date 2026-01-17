# API Contract for REQ-4 - 乘客管理系统

> Auto-generated contract based on requirement ID mapping.

## REQ-4-1 乘车人列表展示

**Description**: 展示所有已保存的乘车人数据。 - 排序规则：默认乘客（is_default=true）置顶，其余按创建时间升序排列。 - 数据脱敏：   - 证件号：保留前 4 位和后 3 位，中间 10 位掩码（*...

### API Specification

- **Method**: `GET`
- **Endpoint**: `/api/v1/passengers`
- **Summary**: 乘客列表 (Get Passengers)
- **Response Model**: `Response[List[PassengerResponse]]`

**Contract Status**: ✅ Mapped to Existing Backend

---

### REQ-4-1-1 列表分页与搜索

**Description**: 每页显示 10 条数据，支持按姓名模糊搜索（前端过滤）。...

---

## REQ-4-2 新增乘车人

**Description**: 提供对话框表单用于添加新成员。 - 表单校验规则：   - 姓名：必填，不低于 2 个字符。   - 证件类型：下拉选择（身份证、港澳通行证、台胞证、护照）。   - 证件号码：必填，需符合基本格式。...

### API Specification

- **Method**: `POST`
- **Endpoint**: `/api/v1/passengers`
- **Summary**: 新增乘客 (Create Passenger)
- **Request Model**: `PassengerCreate`
- **Response Model**: `Response[PassengerResponse]`

**Contract Status**: ✅ Mapped to Existing Backend

---

## REQ-4-3 修改乘车人信息

**Description**: 点击操作列的编辑图标，回填数据至表单进行修改。 - 特殊限制：不支持修改默认乘客（本人）的信息。...

### API Specification

- **Method**: `PUT`
- **Endpoint**: `/api/v1/passengers/{passenger_id}`
- **Summary**: 修改乘客 (Update Passenger)
- **Request Model**: `PassengerUpdate`
- **Response Model**: `Response[PassengerResponse]`

**Contract Status**: ✅ Mapped to Existing Backend

---

## REQ-4-4 删除与批量删除

**Description**: - 单个删除：点击行末尾的删除图标。 - 批量删除：勾选多行后点击顶部的“批量删除”。 - 安全约束：   1. “本人”所在的行，多选框置灰禁用，操作列显示“默认乘客”文字，禁止删除。   2. 后...

### API Specification

- **Method**: `DELETE`
- **Endpoint**: `/api/v1/passengers/{passenger_id}`
- **Summary**: 删除乘客 (Delete Passenger)
- **Response Model**: `Response`

**Contract Status**: ✅ Mapped to Existing Backend

---

## REQ-4-5 后端数据同步逻辑

**Description**: 系统启动时（onMounted）会静默调用 `/sync-default` 接口。 逻辑：如果数据库中尚无当前用户的默认乘客记录，则自动抓取 User 表中的真实姓名、证件、电话创建一条 `is_de...

### API Specification

- **Method**: `POST`
- **Endpoint**: `/api/v1/passengers/sync-default`
- **Summary**: 数据同步 (Sync Default Passenger)
- **Response Model**: `Response[PassengerResponse]`

**Contract Status**: ✅ Mapped to Existing Backend

---

