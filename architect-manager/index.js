#!/usr/bin/env node
const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const server = new McpServer({
  name: "Architect-Manager",
  version: "1.1.0",
});

// --- 基础文件与数据操作 ---

function loadYaml(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return yaml.load(fileContents);
  } catch (e) {
    console.error(`[Error] Failed to load YAML at ${filePath}:`, e);
    return null;
  }
}

function saveYaml(filePath, data) {
  try {
    const dirname = path.dirname(filePath);
    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, { recursive: true });
    }
    const yamlStr = yaml.dump(data, { indent: 2, lineWidth: -1 }); // lineWidth: -1 防止长字符串折行
    fs.writeFileSync(filePath, yamlStr, 'utf8');
  } catch (e) {
    console.error(`[Error] Failed to save YAML at ${filePath}:`, e);
    throw e;
  }
}

function validateInputs(args) {
  if (!args || typeof args !== 'object') {
     return "ERROR: No arguments received. Please provide inputs as a JSON object.";
  }
  const { project_root } = args;
  if (!project_root || project_root.trim() === '') {
    return "ERROR: Missing 'project_root'. Please provide the absolute path.";
  }
  return null;
}

// --- 树遍历与搜索逻辑 ---

function findRequirementById(node, id) {
  if (!node) return null;
  if (node.id === id) return node;
  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      const found = findRequirementById(child, id);
      if (found) return found;
    }
  }
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findRequirementById(item, id);
      if (found) return found;
    }
  }
  return null;
}

function findParentByChildId(node, childId) {
  if (!node || typeof node !== 'object') return null;

  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findParentByChildId(item, childId);
      if (found) return found;
    }
    return null;
  }

  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      if (child.id === childId) {
        return node;
      }
      const found = findParentByChildId(child, childId);
      if (found) return found;
    }
  }
  return null;
}

function flattenPreOrder(node, list) {
  if (!node) return;
  if (Array.isArray(node)) {
    node.forEach(item => flattenPreOrder(item, list));
    return;
  }
  if (node.id) list.push({ id: node.id, status: 'unprocessed' });
  if (node.children && Array.isArray(node.children)) {
    node.children.forEach(child => flattenPreOrder(child, list));
  }
}

function flattenPostOrder(node, list) {
  if (!node) return;
  if (Array.isArray(node)) {
    node.forEach(item => flattenPostOrder(item, list));
    return;
  }
  if (node.children && Array.isArray(node.children)) {
    node.children.forEach(child => flattenPostOrder(child, list));
  }
  if (node.id) list.push({ id: node.id, status: 'unprocessed' });
}

// --- 接口收集逻辑 ---

function collectInterfaces(projectRoot, artifacts) {
  const uiPath = path.join(projectRoot, 'artifacts', 'ui_interface.yaml');
  const apiPath = path.join(projectRoot, 'artifacts', 'api_interface.yaml');
  const funcPath = path.join(projectRoot, 'artifacts', 'func_interface.yaml');
  const uiIndex = loadYaml(uiPath) || {};
  const apiIndex = loadYaml(apiPath) || {};
  const funcIndex = loadYaml(funcPath) || {};
  const result = { ui: [], api: [], func: [] };
  if (!artifacts || typeof artifacts !== 'object') return result;
  if (Array.isArray(artifacts.ui_ids)) {
    artifacts.ui_ids.forEach(id => {
      const item = uiIndex[id];
      result.ui.push({ id, path: item && item.path ? item.path : null });
    });
  }
  if (Array.isArray(artifacts.api_ids)) {
    artifacts.api_ids.forEach(id => {
      const item = apiIndex[id];
      result.api.push({ id, path: item && item.path ? item.path : null });
    });
  }
  if (Array.isArray(artifacts.func_ids)) {
    artifacts.func_ids.forEach(id => {
      const item = funcIndex[id];
      result.func.push({ id, path: item && item.path ? item.path : null });
    });
  }
  return result;
}

function collectRequirementInterfaces(projectRoot, reqId) {
  const uiPath = path.join(projectRoot, 'artifacts', 'ui_interface.yaml');
  const apiPath = path.join(projectRoot, 'artifacts', 'api_interface.yaml');
  const funcPath = path.join(projectRoot, 'artifacts', 'func_interface.yaml');
  const uiIndex = loadYaml(uiPath) || {};
  const apiIndex = loadYaml(apiPath) || {};
  const funcIndex = loadYaml(funcPath) || {};
  const result = { ui: [], api: [], func: [] };
  Object.entries(uiIndex).forEach(([id, item]) => {
    const rel = item && item.related_req_id;
    if ((Array.isArray(rel) && rel.includes(reqId)) || rel === reqId) {
      result.ui.push({ id, ...item });
    }
  });
  Object.entries(apiIndex).forEach(([id, item]) => {
    const rel = item && item.related_req_id;
    if ((Array.isArray(rel) && rel.includes(reqId)) || rel === reqId) {
      result.api.push({ id, ...item });
    }
  });
  Object.entries(funcIndex).forEach(([id, item]) => {
    const rel = item && item.related_req_id;
    if ((Array.isArray(rel) && rel.includes(reqId)) || rel === reqId) {
      result.func.push({ id, ...item });
    }
  });
  return result;
}

function resolveProjectPath(projectRoot, filePath) {
  if (!filePath) return null;
  if (path.isAbsolute(filePath)) return filePath;
  return path.join(projectRoot, filePath);
}

function loadMetadataIndex(projectRoot) {
  const indexPath = path.join(projectRoot, 'docs', 'metadata_index.yaml');
  const metadata = loadYaml(indexPath);
  if (!metadata) {
    console.error(`[Warning] metadata_index.yaml not found or invalid at ${indexPath}`);
  }
  return metadata;
}

function getMetadataFilePath(projectRoot, metadata) {
  const rel = metadata && metadata.metadata_file ? metadata.metadata_file : 'docs/metadata.md';
  return path.join(projectRoot, rel);
}

function loadMetadataSectionByKey(projectRoot, sectionKey) {
  const metadata = loadMetadataIndex(projectRoot);
  if (!metadata || !metadata.sections) {
    return { error: "metadata_index.yaml missing or does not define sections." };
  }
  const title = metadata.sections[sectionKey];
  if (!title) {
    return { error: `Section key '${sectionKey}' not found in metadata_index.yaml sections.` };
  }
  const metadataPath = getMetadataFilePath(projectRoot, metadata);
  if (!fs.existsSync(metadataPath)) {
    return { error: `Metadata file not found at ${metadataPath}` };
  }
  const raw = fs.readFileSync(metadataPath, 'utf8');
  const lines = raw.split(/\r?\n/);
  const startIndex = lines.findIndex(line => line.includes(title) && line.trim().startsWith("## "));
  if (startIndex === -1) {
    return { error: `Title '${title}' for section '${sectionKey}' not found in metadata file.` };
  }
  let endIndex = lines.length;
  for (let i = startIndex + 1; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith("## ") && !trimmed.startsWith("###")) {
      endIndex = i;
      break;
    }
  }
  const slice = lines.slice(startIndex, endIndex);
  return {
    section_key: sectionKey,
    title,
    start_line: startIndex + 1,
    end_line: endIndex,
    content: slice.join("\n"),
  };
}

function validateFileExtension(filePath, allowedExts) {
  if (!filePath) return { ok: true };
  if (!Array.isArray(allowedExts) || allowedExts.length === 0) return { ok: true };
  const ext = path.extname(filePath);
  if (!allowedExts.includes(ext)) {
    return { ok: false, message: `File ${filePath} uses unsupported extension ${ext}` };
  }
  return { ok: true };
}

function isWithinDir(targetPath, dir) {
  if (!targetPath || !dir) return true;
  const normTarget = path.resolve(targetPath);
  const normDir = path.resolve(dir);
  return normTarget === normDir || normTarget.startsWith(normDir + path.sep);
}

function validateUiRegistration(projectRoot, metadata, filePath) {
  if (!metadata || !metadata.frontend || !metadata.constraints) return { ok: true };
  const absPath = resolveProjectPath(projectRoot, filePath);
  const extCheck = validateFileExtension(absPath, metadata.constraints.allowed_frontend_ext);
  if (!extCheck.ok) return extCheck;
  const root = metadata.frontend.root ? path.join(projectRoot, metadata.frontend.root) : null;
  const componentsDir = metadata.frontend.components_dir ? path.join(projectRoot, metadata.frontend.components_dir) : null;
  const viewsDir = metadata.frontend.views_dir ? path.join(projectRoot, metadata.frontend.views_dir) : null;
  const candidates = [root, componentsDir, viewsDir].filter(Boolean);
  if (candidates.length === 0) return { ok: true };
  const within = candidates.some(dir => isWithinDir(absPath, dir));
  if (!within) {
    return { ok: false, message: `UI component path ${filePath} is outside allowed frontend directories` };
  }
  return { ok: true };
}

function parseSignaturePath(signature) {
  if (!signature || typeof signature !== 'string') return null;
  const parts = signature.trim().split(/\s+/);
  if (parts.length < 2) return null;
  return parts[1];
}

function validateApiRegistration(projectRoot, metadata, filePath, signature) {
  if (!metadata || !metadata.backend || !metadata.constraints) return { ok: true };
  const absPath = resolveProjectPath(projectRoot, filePath);
  const extCheck = validateFileExtension(absPath, metadata.constraints.allowed_backend_ext);
  if (!extCheck.ok) return extCheck;
  const endpointsDir = metadata.backend.endpoints_dir ? path.join(projectRoot, metadata.backend.endpoints_dir) : null;
  const backendRoot = metadata.backend.root ? path.join(projectRoot, metadata.backend.root) : null;
  const candidates = [endpointsDir || backendRoot].filter(Boolean);
  if (candidates.length > 0) {
    const within = candidates.some(dir => isWithinDir(absPath, dir));
    if (!within) {
      return { ok: false, message: `API endpoint path ${filePath} is outside allowed backend endpoint directories` };
    }
  }
  if (metadata.api_prefix) {
    const sigPath = parseSignaturePath(signature);
    if (sigPath && !sigPath.startsWith(metadata.api_prefix)) {
      return { ok: false, message: `API signature path ${sigPath} must start with prefix ${metadata.api_prefix}` };
    }
  }
  return { ok: true };
}

function validateBackendFunctionRegistration(projectRoot, metadata, filePath) {
  if (!metadata || !metadata.backend || !metadata.constraints) return { ok: true };
  const absPath = resolveProjectPath(projectRoot, filePath);
  const extCheck = validateFileExtension(absPath, metadata.constraints.allowed_backend_ext);
  if (!extCheck.ok) return extCheck;
  const backendRoot = metadata.backend.root ? path.join(projectRoot, metadata.backend.root) : null;
  if (!backendRoot) return { ok: true };
  const within = isWithinDir(absPath, backendRoot);
  if (!within) {
    return { ok: false, message: `Backend function path ${filePath} is outside backend root ${metadata.backend.root}` };
  }
  return { ok: true };
}

// --- 核心业务逻辑 ---

function popNextRequirement(projectRoot, progressFileName, reqDocPath) {
  const progressPath = path.join(projectRoot, 'artifacts', progressFileName);

  // 1. 检查进度文件
  const progressList = loadYaml(progressPath);
  if (!progressList || !Array.isArray(progressList)) {
    return { error: `Progress file not found at ${progressPath}. Please run the init tool first.` };
  }

  // 2. 查找未处理任务
  const taskIndex = progressList.findIndex(item => item.status === 'unprocessed');
  if (taskIndex === -1) {
    return { message: "All requirements in this phase are completed.", completed: true };
  }

  const currentTask = progressList[taskIndex];
  console.error(`[Debug] Processing task ID: ${currentTask.id}`);

  // 3. 读取原始需求
  const rawReqs = loadYaml(reqDocPath);
  if (!rawReqs) {
    return { error: `Requirements document not found at ${reqDocPath}` };
  }

  const reqNode = findRequirementById(rawReqs, currentTask.id);
  if (!reqNode) {
    return { error: `Requirement ID ${currentTask.id} found in queue but not in source document.` };
  }

  // 4. 更新状态
  progressList[taskIndex].status = 'processed';
  saveYaml(progressPath, progressList);

  // 5. 准备返回数据：保留直接子节点，但移除孙节点 (Grandchildren)
  const { children, ...basicInfo } = reqNode;

  let directChildren = [];
  if (children && Array.isArray(children)) {
    directChildren = children.map(child => {
      // 解构出孙节点并丢弃，只保留子节点本身的属性
      const { children: grandChildren, ...childProps } = child;
      return childProps;
    });
  }

  const finalRequirement = {
    ...basicInfo,
    children: directChildren
  };

  // --- 新增逻辑：提取并加载图片 ---
  // 获取需求文档所在的目录，因为图片路径通常是相对于文档的
  const reqDocDir = path.dirname(reqDocPath);
  const loadedImages = extractImages(reqDocDir, finalRequirement.description);

  // 6. 准备父节点信息
  const parentNode = findParentByChildId(rawReqs, reqNode.id);
  let parentInfo = null;
  if (parentNode) {
    const parentTask = progressList.find(item => item.id === parentNode.id);
    const interfaces = parentTask && parentTask.artifacts ? collectInterfaces(projectRoot, parentTask.artifacts) : { ui: [], api: [], func: [] };
    parentInfo = {
      name: parentNode.name,
      description: parentNode.description,
      interfaces
    };
  }

  return {
    status: 'success',
    progress: `${taskIndex + 1}/${progressList.length}`,
    requirement: finalRequirement,
    parent: parentInfo,
    images: loadedImages
  };
}

function updateRequirementArtifacts(projectRoot, reqId, category, artifactId) {
  const progressPath = path.join(projectRoot, 'artifacts', 'phase_one_progress.yaml');
  const progressList = loadYaml(progressPath);

  if (!progressList || !Array.isArray(progressList)) {
    console.error(`[Warning] Could not update artifacts linkage: Progress file not found.`);
    return;
  }

  const taskIndex = progressList.findIndex(item => item.id === reqId);
  if (taskIndex === -1) {
    console.error(`[Warning] Could not link artifact ${artifactId} to req ${reqId}: Req not found in progress.`);
    return;
  }

  // 初始化 artifacts 结构
  if (!progressList[taskIndex].artifacts) {
    progressList[taskIndex].artifacts = {};
  }
  if (!progressList[taskIndex].artifacts[category]) {
    progressList[taskIndex].artifacts[category] = [];
  }

  // 去重添加
  const list = progressList[taskIndex].artifacts[category];
  if (!list.includes(artifactId)) {
    list.push(artifactId);
    console.error(`[Debug] Linked ${artifactId} to ${reqId} in ${category}`);
    saveYaml(progressPath, progressList);
  }
}

function registerInterfaceItem(projectRoot, fileName, itemId, newItemData, mergeArrays = []) {
  const filePath = path.join(projectRoot, 'artifacts', fileName);
  let data = loadYaml(filePath) || {};

  if (data[itemId]) {
    // 更新
    const existing = data[itemId];
    existing.path = newItemData.path || existing.path;
    existing.description = newItemData.description || existing.description;
    existing.signature = newItemData.signature || existing.signature;
    
    // 数组合并
    mergeArrays.forEach(field => {
      if (newItemData[field] && Array.isArray(newItemData[field])) {
        const oldSet = new Set(existing[field] || []);
        newItemData[field].forEach(item => oldSet.add(item));
        existing[field] = Array.from(oldSet);
      }
    });

    data[itemId] = existing;
  } else {
    // 新建
    data[itemId] = newItemData;
  }

  saveYaml(filePath, data);
  return { status: "success" };
}

// --- 图片提取逻辑 ---

function extractImages(baseDir, text) {
  if (!text || typeof text !== "string") return {};

  const images = {};
  const regex = /(?:!\[.*?\]|\[.*?\])\((.*?)\)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const relativePath = match[1];

    if (!/\.(png|jpg|jpeg|gif|bmp|webp|svg)$/i.test(relativePath)) {
      continue;
    }

    try {
      const absPath = path.resolve(baseDir, relativePath);

      if (fs.existsSync(absPath)) {
        const fileBuffer = fs.readFileSync(absPath);
        images[relativePath] = fileBuffer.toString("base64");
      } else {
        console.warn(`[Warning] Image file not found: ${absPath}`);
      }
    } catch (e) {
      console.error(`[Error] Failed to read image ${relativePath}:`, e.message);
    }
  }
  return images;
}

function safeUnlink(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (e) {
    console.error(`[Warning] Failed to delete file ${filePath}: ${e.message}`);
  }
}

function getPhaseOnePaths(projectRoot) {
  const artifactsDir = path.join(projectRoot, "artifacts");
  const progressPath = path.join(artifactsDir, "phase_one_progress.yaml");
  const metaPath = path.join(artifactsDir, "phase_one_meta.yaml");
  const uiPath = path.join(artifactsDir, "ui_interface.yaml");
  const apiPath = path.join(artifactsDir, "api_interface.yaml");
  const funcPath = path.join(artifactsDir, "func_interface.yaml");
  return { artifactsDir, progressPath, metaPath, uiPath, apiPath, funcPath };
}

// --- Tool Definitions ---

// 1. Init Queue
server.tool(
  "init_top_down_queue",
  "Initialize Phase 1 (Design). [REQUIRED: project_root, requirements_path].",
  {
    project_root: z.string().describe("MANDATORY. Project root path."),
    requirements_path: z.string().describe("MANDATORY. Requirements file path."),
  },
  async (args) => {
    console.error("[Debug] init_top_down_queue args:", JSON.stringify(args));
    const validationError = validateInputs(args);
    if (validationError) return { content: [{ type: "text", text: validationError }] };
    const { project_root, requirements_path } = args;

    try {
      const { artifactsDir, progressPath, metaPath, uiPath, apiPath, funcPath } = getPhaseOnePaths(project_root);
      if (!fs.existsSync(artifactsDir)) {
        fs.mkdirSync(artifactsDir, { recursive: true });
      }

      const requestedAbs = path.resolve(project_root, requirements_path);

      if (fs.existsSync(progressPath)) {
        let matched = false;
        if (fs.existsSync(metaPath)) {
          const meta = loadYaml(metaPath);
          if (meta && typeof meta === "object") {
            const storedAbs =
              meta.requirements_abs_path ||
              (meta.requirements_path ? path.resolve(project_root, meta.requirements_path) : null);
            if (storedAbs && storedAbs === requestedAbs) {
              matched = true;
            }
          }
        }

        if (matched) {
          return {
            content: [
              {
                type: "text",
                text: `Phase 1 is already initialized for requirements file: ${requirements_path}`,
              },
            ],
          };
        }

        safeUnlink(progressPath);
        safeUnlink(metaPath);
        safeUnlink(uiPath);
        safeUnlink(apiPath);
        safeUnlink(funcPath);
      }

      const rawReqs = loadYaml(requirements_path);
      if (!rawReqs) {
        return { content: [{ type: "text", text: "Failed to load requirements file." }] };
      }

      const queue = [];
      flattenPreOrder(rawReqs, queue);
      saveYaml(progressPath, queue);
      saveYaml(metaPath, {
        requirements_path,
        requirements_abs_path: requestedAbs,
        created_at: new Date().toISOString(),
      });

      return {
        content: [
          {
            type: "text",
            text: `Initialized Phase 1 queue with ${queue.length} items for requirements file: ${requirements_path}`,
          },
        ],
      };
    } catch (err) {
      return { content: [{ type: "text", text: `Error: ${err.message}` }] };
    }
  }
);

server.tool(
  "reset_top_down_queue",
  "Reinitialize Phase 1 (Design) queue and clear related artifacts. [REQUIRED: project_root, requirements_path].",
  {
    project_root: z.string().describe("MANDATORY. Project root path."),
    requirements_path: z.string().describe("MANDATORY. Requirements file path."),
  },
  async (args) => {
    console.error("[Debug] reset_top_down_queue args:", JSON.stringify(args));
    const validationError = validateInputs(args);
    if (validationError) {
      return { content: [{ type: "text", text: validationError }] };
    }
    const { project_root, requirements_path } = args;

    try {
      const { artifactsDir, progressPath, metaPath, uiPath, apiPath, funcPath } = getPhaseOnePaths(project_root);
      if (!fs.existsSync(artifactsDir)) {
        fs.mkdirSync(artifactsDir, { recursive: true });
      }

      safeUnlink(progressPath);
      safeUnlink(metaPath);
      safeUnlink(uiPath);
      safeUnlink(apiPath);
      safeUnlink(funcPath);

      const rawReqs = loadYaml(requirements_path);
      if (!rawReqs) {
        return { content: [{ type: "text", text: "Failed to load requirements file." }] };
      }

      const queue = [];
      flattenPreOrder(rawReqs, queue);
      saveYaml(progressPath, queue);
      const requestedAbs = path.resolve(project_root, requirements_path);
      saveYaml(metaPath, {
        requirements_path,
        requirements_abs_path: requestedAbs,
        created_at: new Date().toISOString(),
        reset: true,
      });

      return {
        content: [
          {
            type: "text",
            text: `Reset Phase 1 queue with ${queue.length} items for requirements file: ${requirements_path}`,
          },
        ],
      };
    } catch (err) {
      return { content: [{ type: "text", text: `Error: ${err.message}` }] };
    }
  }
);

// 2. Pop Req
server.tool(
  "pop_req_to_design",
  "Get next requirement for Phase 1. [REQUIRED: project_root, requirements_path].",
  {
    project_root: z.string().describe("MANDATORY. Project root path."),
    requirements_path: z.string().describe("MANDATORY. Requirements file path."),
  },
  async (args) => {
    console.error("[Debug] pop_req_to_design args:", JSON.stringify(args));
    const validationError = validateInputs(args);
    if (validationError) return { content: [{ type: "text", text: validationError }] };
    const { project_root, requirements_path } = args;

    try {
      const result = popNextRequirement(project_root, 'phase_one_progress.yaml', requirements_path);
      const textResult = result ? yaml.dump(result) : "Error: Internal function returned null";
      return { content: [{ type: "text", text: textResult }] };
    } catch (err) {
      return { content: [{ type: "text", text: `Error: ${err.message}` }] };
    }
  }
);

// 3. Register UI (增强版：自动回写 phase_one_progress.yaml)
server.tool(
  "register_ui_component",
  "Register UI Component. [REQUIRED: project_root, id, path, related_req_id].",
  {
    project_root: z.string().describe("MANDATORY."),
    id: z.string().describe("UI ID (e.g., UI-SEARCH-FORM)."),
    path: z.string().describe("File path."),
    description: z.string().optional(),
    related_req_id: z.string().describe("Requirement ID triggering this design."),
    upstream_ids: z.array(z.string()).optional(),
    downstream_ids: z.array(z.string()).optional(),
  },
  async (args) => {
    console.error("[Debug] register_ui_component:", JSON.stringify(args, null, 2));
    const validationError = validateInputs(args);
    if (validationError) return { content: [{ type: "text", text: validationError }] };

    const { project_root, id, related_req_id, ...data } = args;
    
    try {
      const metadata = loadMetadataIndex(project_root);
      const check = validateUiRegistration(project_root, metadata, data.path);
      if (!check.ok) {
        return { content: [{ type: "text", text: `ValidationError: ${check.message}` }] };
      }
      // 1. 注册到 ui_interface.yaml
      registerInterfaceItem(project_root, 'ui_interface.yaml', id, { related_req_id, ...data }, ['upstream_ids', 'downstream_ids']);
      
      // 2. 回写到 phase_one_progress.yaml
      if (related_req_id) {
        updateRequirementArtifacts(project_root, related_req_id, 'ui_ids', id);
      }

      return { content: [{ type: "text", text: `Success: Registered UI ${id} and linked to ${related_req_id}` }] };
    } catch (err) {
      return { content: [{ type: "text", text: `Error: ${err.message}` }] };
    }
  }
);

// 4. Register API (增强版)
server.tool(
  "register_api_endpoint",
  "Register API Endpoint. [REQUIRED: project_root, id, signature, related_req_id].",
  {
    project_root: z.string().describe("MANDATORY."),
    id: z.string().describe("API ID."),
    path: z.string().describe("File path."),
    signature: z.string().describe("Method + Path."),
    related_req_id: z.string().describe("Requirement ID."),
    upstream_ids: z.array(z.string()).optional(),
    downstream_ids: z.array(z.string()).optional(),
  },
  async (args) => {
    console.error("[Debug] register_api_endpoint:", JSON.stringify(args, null, 2));
    const validationError = validateInputs(args);
    if (validationError) return { content: [{ type: "text", text: validationError }] };

    const { project_root, id, related_req_id, ...data } = args;

    try {
      const metadata = loadMetadataIndex(project_root);
      const check = validateApiRegistration(project_root, metadata, data.path, data.signature);
      if (!check.ok) {
        return { content: [{ type: "text", text: `ValidationError: ${check.message}` }] };
      }
      // 1. 注册到 api_interface.yaml
      registerInterfaceItem(project_root, 'api_interface.yaml', id, { related_req_id, ...data }, ['upstream_ids', 'downstream_ids']);

      // 2. 回写到 phase_one_progress.yaml
      if (related_req_id) {
        updateRequirementArtifacts(project_root, related_req_id, 'api_ids', id);
      }

      return { content: [{ type: "text", text: `Success: Registered API ${id} and linked to ${related_req_id}` }] };
    } catch (err) {
      return { content: [{ type: "text", text: `Error: ${err.message}` }] };
    }
  }
);

// 5. Register Function (增强版)
server.tool(
  "register_backend_function",
  "Register Backend Function. [REQUIRED: project_root, id, signature, related_req_id].",
  {
    project_root: z.string().describe("MANDATORY."),
    id: z.string().describe("Function ID."),
    path: z.string().describe("File path."),
    signature: z.string().describe("Function signature."),
    related_req_id: z.string().describe("Requirement ID."),
    upstream_ids: z.array(z.string()).optional(),
    db_tables: z.array(z.string()).optional(),
  },
  async (args) => {
    console.error("[Debug] register_backend_function:", JSON.stringify(args, null, 2));
    const validationError = validateInputs(args);
    if (validationError) return { content: [{ type: "text", text: validationError }] };

    const { project_root, id, related_req_id, ...data } = args;

    try {
      const metadata = loadMetadataIndex(project_root);
      const check = validateBackendFunctionRegistration(project_root, metadata, data.path);
      if (!check.ok) {
        return { content: [{ type: "text", text: `ValidationError: ${check.message}` }] };
      }
      // 1. 注册到 func_interface.yaml
      registerInterfaceItem(project_root, 'func_interface.yaml', id, { related_req_id, ...data }, ['upstream_ids', 'db_tables']);

      // 2. 回写到 phase_one_progress.yaml
      if (related_req_id) {
        updateRequirementArtifacts(project_root, related_req_id, 'func_ids', id);
      }

      return { content: [{ type: "text", text: `Success: Registered Function ${id} and linked to ${related_req_id}` }] };
    } catch (err) {
      return { content: [{ type: "text", text: `Error: ${err.message}` }] };
    }
  }
);

// 6. Init Phase 2 Queue
server.tool(
  "init_bottom_up_queue",
  "Initialize Phase 2 (Implementation). [REQUIRED: project_root, requirements_path].",
  {
    project_root: z.string().describe("MANDATORY."),
    requirements_path: z.string().describe("MANDATORY."),
  },
  async (args) => {
    console.error("[Debug] init_bottom_up_queue args:", JSON.stringify(args));
    const validationError = validateInputs(args);
    if (validationError) return { content: [{ type: "text", text: validationError }] };
    const { project_root, requirements_path } = args;

    try {
      const outputPath = path.join(project_root, 'artifacts', 'phase_two_progress.yaml');
      if (fs.existsSync(outputPath)) {
        return { content: [{ type: "text", text: `Phase 2 is already initialized. Progress file exists at: ${outputPath}` }] };
      }
      const rawReqs = loadYaml(requirements_path);
      if (!rawReqs) return { content: [{ type: "text", text: "Failed to load requirements file." }] };

      const queue = [];
      flattenPostOrder(rawReqs, queue);
      saveYaml(outputPath, queue);

      return { content: [{ type: "text", text: `Initialized Phase 2 queue with ${queue.length} items.` }] };
    } catch (err) {
      return { content: [{ type: "text", text: `Error: ${err.message}` }] };
    }
  }
);

// 7. Pop Phase 2 Req
server.tool(
  "pop_req_to_implement",
  "Get next requirement for Phase 2. [REQUIRED: project_root, requirements_path].",
  {
    project_root: z.string().describe("MANDATORY."),
    requirements_path: z.string().describe("MANDATORY."),
  },
  async (args) => {
    console.error("[Debug] pop_req_to_implement args:", JSON.stringify(args));
    const validationError = validateInputs(args);
    if (validationError) return { content: [{ type: "text", text: validationError }] };
    const { project_root, requirements_path } = args;

    try {
      const result = popNextRequirement(project_root, 'phase_two_progress.yaml', requirements_path);
      if (result && result.status === 'success' && result.requirement && result.requirement.id) {
        result.requirement_interfaces = collectRequirementInterfaces(project_root, result.requirement.id);
      }
      const textResult = result ? yaml.dump(result) : "Error: Internal function returned null";
      return { content: [{ type: "text", text: textResult }] };
    } catch (err) {
      return { content: [{ type: "text", text: `Error: ${err.message}` }] };
    }
  }
);

server.tool(
  "get_metadata_section",
  "Get specific section from metadata.md using section key defined in metadata_index.yaml.",
  {
    project_root: z.string().describe("MANDATORY. Project root path."),
    section_key: z.string().describe("Section key in metadata_index.yaml 'sections' map, for example 'auth_rbac'."),
  },
  async (args) => {
    console.error("[Debug] get_metadata_section args:", JSON.stringify(args));
    const validationError = validateInputs(args);
    if (validationError) return { content: [{ type: "text", text: validationError }] };
    const { project_root, section_key } = args;

    if (!section_key || typeof section_key !== "string" || section_key.trim() === "") {
      return { content: [{ type: "text", text: "ERROR: 'section_key' is required and must be a non-empty string." }] };
    }

    try {
      const result = loadMetadataSectionByKey(project_root, section_key);
      const textResult = yaml.dump(result);
      return { content: [{ type: "text", text: textResult }] };
    } catch (err) {
      return { content: [{ type: "text", text: `Error: ${err.message}` }] };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("TDD Architect MCP Server (v1.3 Linked) running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
