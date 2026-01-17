# API Contract for REQ-1 - 车票查询与展示

> Auto-generated contract based on requirement ID mapping.

## REQ-1-1 综合搜索表单

**Description**: 用户在此设置查询核心条件。 - 类型切换：点击“单程”或“往返”时，路由在 `/leftTicket/single` 和 `/leftTicket/round` 间切换。 - 状态填充：url 查询参...

### API Specification

- **Method**: `GET`
- **Endpoint**: `/api/v1/trains/search`
- **Summary**: 综合搜索表单 (使用Search接口)
- **Response Model**: `Response[List[TrainSearchResponse]]`

**Contract Status**: ✅ Mapped to Existing Backend

---

### REQ-1-1-1 往返/单程切换

**Description**: 切换 radio 按钮，单程模式下返程日置灰禁用，往返模式下返程日可点击。...

---

### REQ-1-1-2 智能城市选择组件 (CitySelector)

**Description**: - 聚焦输入框时弹出选择浮层。 - 拼音/首字母匹配：输入 "bj" 或 "beijing" 自动弹出搜索结果（CitySearch）。 - 热门城市：展示 20 个热门城市。 - 拼音分层：按 AB...

---

### REQ-1-1-3 双月日历组件 (DateSelector)

**Description**: - 展示当前月及下一月两个完整日历。 - 时间跨度限制：无法选择今天之前的日期。 - 特殊标记：今天标记为“今天”，周末及节假日文字颜色为红色（#c60b02）。 - 快速选择：底部提供“今天”快捷按...

---

### REQ-1-1-4 出发/到达地位互换

**Description**: 点击按钮，交换 from 和 to 的值，并自动触发一次查询。...

---

## REQ-1-2 15天日期快速切换

**Description**: 结果列表上方的页签，展示从今天起的连续 15 天。点击任何日期页签，自动更新搜索结果并同步到顶部的出发日输入框。...

---

## REQ-1-3 实时筛选面板

**Description**: 系统采用“后端检索+前端实时二次过滤”混合模式： - 后端过滤 (API-level)：发车时间段（filterTime）改变时，会重新向后端发送带 `min_departure_time` 的请求。...

---

### REQ-1-3-1 时间段快速选择

**Description**: 下拉框采用 8 位字符串标识范围（如 06001200 表示 06:00-12:00），并在发送请求前提取起始时间转换为 HH:MM 格式。...

---

### REQ-1-3-2 车次类型过滤 (逻辑映射)

**Description**: 前端映射表：G/C/复->高铁/城际，D/智->动车，Z/T/K->直达。选中一个类型后，需匹配该车次的 `train_type` 属性。...

---

### REQ-1-3-3 动态车站过滤

**Description**: 根据当前查询结果中的实际出现的所有车站生成多选列表。...

---

### REQ-1-3-4 席别过滤

**Description**: 过滤一等座、二等座、软卧等具有余票的车次。...

---

## REQ-1-4 车次结果列表展示

**Description**: 采用表格形式展示，支持数据响应式布局，处理空状态加载。...

---

### REQ-1-4-1 车次核心信息展示

**Description**: - 车次号：如 "G21"，点击触发 `showStopStation`（记录停靠点）。 - 特征标签：显示：“智”（智能动车组）、“复”（复兴号）、“静”（静音车厢）。 - 查看票价：点击车次旁的蓝...

### API Specification

- **Method**: `GET`
- **Endpoint**: `/api/v1/trains/{train_number}`
- **Summary**: 车次详情 (Train Detail)
- **Response Model**: `Response[TrainDetailResponse]`

**Contract Status**: ✅ Mapped to Existing Backend

---

### REQ-1-4-2 时钟与历时展示

**Description**: - 出发/到达时间采用较大字体。 - 跨天标记：根据后端 `arrival_day_offset` 指示显示“当日到达”或“次日到达”。...

---

### REQ-1-4-3 席别与余票显示逻辑

**Description**: - “有”：绿字显示。 - “数字”：直接显示（如 "5"）。 - “无”：灰色文本。 - 候补：显示候补，且右侧带橙色加号图标（icon-add-fill）。...

### API Specification

- **Method**: `GET`
- **Endpoint**: `/api/v1/trains/{train_number}/availability`
- **Summary**: 余票查询 (Seat Availability)
- **Response Model**: `Response[TrainAvailabilityResponse]`

**Contract Status**: ✅ Mapped to Existing Backend

---

### REQ-1-4-4 预订操作

**Description**: 点击“预订”按钮，将购票参数（日期、车次、站名等）通过 URL Query 传递至订单页。...

---

## REQ-1-5 列表排序逻辑

**Description**: 前端排序： - 时间排序：对 "14:30" 类字符串排序。 - 历时排序：转化为总分钟数后升序/降序。...

---

## REQ-1-6 API 同步与交互

**Description**: - 响应式监听：URL 改变时刷新。 - 异常消息提示：Ant Design Toast 提醒。...

---

## REQ-1-7 数据安全性与鲁棒性

**Description**: - 空结果：显示暂无信息。 - 加载中：显示 LOADING。...

---

## REQ-1-8 用户体验与交互细节

**Description**: - 全局点击拦截机制：确保弹出层唯一性。 - 坐标对齐逻辑。...

---

