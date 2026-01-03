# Implementation Plan: BlockSuite Integration

## Overview

本实施计划将 BlockSuite 编辑器框架集成到现有的 Yueque 本地知识库应用中。实施将分阶段进行，首先建立核心基础设施，然后逐步添加功能，最后进行测试和优化。每个任务都包含具体的实施步骤和需求引用。

## Tasks

- [x] 1. 项目设置和依赖安装
  - 安装 BlockSuite 核心包：@blocksuite/presets, @blocksuite/blocks, @blocksuite/store
  - 安装 Yjs 依赖
  - 安装测试依赖：fast-check, @playwright/test
  - 配置 TypeScript 以支持 Web Components
  - 更新 Vite 配置以优化 BlockSuite 打包
  - _Requirements: 1.1, 1.4_

- [x] 2. BlockSuite Workspace Manager 实现
  - [x] 2.1 创建 WorkspaceManager 类
    - 实现单例模式管理 DocCollection
    - 实现 initialize() 方法注册 AffineSchemas
    - 实现 getOrCreateDoc() 方法
    - 实现 disposeDoc() 方法清理资源
    - 添加 TypeScript 类型定义
    - _Requirements: 1.2, 1.3, 1.5_

  - [x] 2.2 编写 WorkspaceManager 单元测试
    - 测试 DocCollection 创建
    - 测试 Doc 实例管理
    - 测试资源清理
    - _Requirements: 1.2, 1.3_

- [-] 3. Markdown Converter 实现
  - [x] 3.1 创建 MarkdownConverter 类
    - 实现 markdownToBlocks() 方法
    - 实现 blocksToMarkdown() 方法
    - 集成 BlockSuite 的 MarkdownTransformer API
    - 处理常见 Markdown 语法（标题、列表、代码块、链接、图片）
    - 添加错误处理和日志
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 3.2 实现 Markdown 转换的边缘情况处理
    - 处理空文档
    - 处理特殊字符转义
    - 处理深度嵌套结构
    - 处理格式错误的 Markdown
    - _Requirements: 3.4, 3.5_

  - [x] 3.3 编写 Markdown 往返属性测试
    - **Property 1: Markdown Round-Trip Consistency**
    - **Validates: Requirements 3.1, 3.2, 3.3**
    - 使用 fast-check 生成随机 Markdown 文档
    - 测试 Markdown → BlockSuite → Markdown 往返
    - 验证内容语义等价性
    - 运行 100 次迭代
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 3.4 编写转换边缘情况属性测试
    - **Property 5: Conversion Handles Edge Cases**
    - **Validates: Requirements 3.4, 13.1, 13.2**
    - 生成包含边缘情况的 Markdown（空文档、特殊字符、嵌套）
    - 验证转换不崩溃且提供错误信息
    - 运行 100 次迭代
    - _Requirements: 3.4, 3.5_

- [ ] 4. Document Manager 实现
  - [x] 4.1 创建 DocumentManager 类
    - 实现 loadDocument() 方法
    - 实现 saveDocument() 方法
    - 实现自动保存逻辑（1秒 debounce）
    - 实现保存重试机制（最多3次，指数退避）
    - 实现文档状态管理（loading, saving, saved, error）
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 4.2 编写文档保存一致性属性测试
    - **Property 2: Document Save Preserves Content**
    - **Validates: Requirements 4.1, 4.2, 4.3**
    - 生成随机文档内容
    - 保存文档
    - 清除内存状态
    - 重新加载文档
    - 验证内容一致
    - 运行 100 次迭代
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 4.3 编写 DocumentManager 单元测试
    - 测试 debounce 保存逻辑
    - 测试重试机制
    - 测试错误处理
    - 测试状态转换
    - _Requirements: 4.1, 4.4, 4.5_

- [x] 5. Checkpoint - 核心基础设施验证
  - 确保所有测试通过
  - 验证 WorkspaceManager 可以创建和管理 Doc
  - 验证 Markdown 转换往返一致性
  - 验证 DocumentManager 保存和加载流程
  - 如有问题，询问用户

- [ ] 6. BlockSuite Editor React 组件
  - [x] 6.1 创建 BlockSuiteEditor 组件
    - 使用 useRef 管理 PageEditor 实例
    - 实现组件挂载时创建编辑器
    - 实现组件卸载时清理编辑器
    - 连接 Doc 到 PageEditor
    - 监听 Doc 变化并触发保存
    - 添加 TypeScript props 类型
    - _Requirements: 2.1, 2.2, 2.3, 2.6_

  - [x] 6.2 实现编辑器生命周期管理
    - 处理 docId 变化时的编辑器重新初始化
    - 实现正确的资源清理
    - 添加错误边界处理
    - _Requirements: 2.6, 10.5_

  - [x] 6.3 编写编辑器清理属性测试
    - **Property 4: Editor Cleanup Prevents Memory Leaks**
    - **Validates: Requirements 10.5**
    - 模拟多次文档切换
    - 监控 Doc 实例数量
    - 验证没有内存泄漏
    - 运行 100 次迭代
    - _Requirements: 10.5_

- [x] 7. Editor 组件重构
  - [x] 7.1 重构 Editor.tsx 集成 BlockSuiteEditor
    - 移除 textarea 和 ReactMarkdown
    - 集成 BlockSuiteEditor 组件
    - 保留顶部导航栏（面包屑、操作按钮）
    - 保留工具栏（简化为 BlockSuite 相关操作）
    - 移除编辑/预览/分屏模式切换
    - 更新保存状态显示逻辑
    - _Requirements: 2.1, 2.2, 2.5, 12.1, 12.2, 12.3_

  - [x] 7.2 实现错误处理和降级方案
    - 添加 ErrorBoundary 包装 BlockSuiteEditor
    - 实现 BlockSuite 初始化失败时的降级
    - 显示用户友好的错误消息
    - 提供重试和刷新选项
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

  - [x] 7.3 编写 Editor 集成测试
    - 测试文档打开和渲染
    - 测试编辑操作更新状态
    - 测试文档切换
    - 测试错误处理
    - _Requirements: 2.2, 2.3, 2.6_

- [ ] 8. 块编辑功能实现
  - [x] 8.1 配置 BlockSuite 块操作
    - 启用斜杠命令菜单
    - 启用块拖拽
    - 配置键盘快捷键
    - 启用块选择和批量操作
    - 显示块操作手柄
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 8.2 编写块操作有效性属性测试
    - **Property 3: Block Operations Preserve Document Validity**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**
    - 生成随机有效文档
    - 执行随机块操作序列（添加、删除、移动、更新）
    - 验证结果文档仍然有效
    - 运行 100 次迭代
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 9. 富文本和代码块支持
  - [x] 9.1 配置富文本格式化
    - 启用内联格式（粗体、斜体、下划线、删除线、代码）
    - 配置格式化工具栏
    - 配置键盘快捷键
    - 启用链接创建和编辑
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 9.2 配置代码块功能
    - 启用代码块插入
    - 配置语言选择
    - 启用语法高亮
    - 启用行号显示
    - 添加代码复制功能
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 9.3 编写富文本和代码块单元测试
    - 测试各种格式化操作
    - 测试代码块创建和编辑
    - 测试语法高亮
    - _Requirements: 6.1, 6.2, 7.1, 7.2_

- [ ] 10. 图片和附件支持
  - [ ] 10.1 实现图片上传功能
    - 处理图片拖拽上传
    - 实现图片上传 API 调用
    - 显示上传进度
    - 处理上传错误
    - 插入图片到文档
    - _Requirements: 8.1, 8.2, 8.4, 8.5_

  - [ ] 10.2 后端图片存储实现
    - 创建附件目录结构
    - 实现图片保存逻辑
    - 验证文件类型和大小
    - 返回图片 URL
    - _Requirements: 8.3_

  - [ ]* 10.3 编写图片上传属性测试
    - **Property 7: Image Upload Preserves References**
    - **Validates: Requirements 8.1, 8.2, 8.3**
    - 上传随机图片
    - 验证文件存储成功
    - 验证文档中引用正确
    - 验证图片可加载显示
    - 运行 100 次迭代
    - _Requirements: 8.1, 8.2, 8.3_

- [ ] 11. Checkpoint - 功能完整性验证
  - 确保所有测试通过
  - 手动测试所有编辑功能
  - 验证图片上传和显示
  - 验证块操作（拖拽、斜杠命令）
  - 验证富文本格式化
  - 如有问题，询问用户

- [ ] 12. 向后兼容性实现
  - [ ] 12.1 实现现有文档迁移逻辑
    - 检测文档格式版本
    - 自动转换旧格式 Markdown
    - 保留文档元数据
    - 处理转换失败情况
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [ ]* 12.2 编写向后兼容性属性测试
    - **Property 8: Backward Compatibility with Existing Documents**
    - **Validates: Requirements 11.1, 11.2, 11.3, 11.4**
    - 收集现有 Markdown 文档样本
    - 用新编辑器打开
    - 验证内容正确显示
    - 验证没有数据丢失
    - 运行 100 次迭代
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [ ] 12.3 实现 Markdown 导出功能
    - 添加导出按钮到 UI
    - 实现文档导出为 Markdown
    - 保持文件命名和结构
    - _Requirements: 11.5_

- [ ] 13. UI 主题和样式集成
  - [ ] 13.1 自定义 BlockSuite 主题
    - 应用应用的颜色方案
    - 匹配现有字体和排版
    - 实现浅色/深色主题切换
    - 调整编辑器内边距和布局
    - _Requirements: 12.1, 12.4_

  - [ ] 13.2 集成到现有布局
    - 确保编辑器适配三栏布局
    - 调整侧边栏和 AI 面板交互
    - 优化响应式布局
    - _Requirements: 12.5_

  - [ ]* 13.3 编写 UI 集成测试
    - 测试主题切换
    - 测试布局适配
    - 测试响应式行为
    - _Requirements: 12.1, 12.4, 12.5_

- [ ] 14. 性能优化
  - [ ] 14.1 实现代码分割和懒加载
    - 使用 React.lazy 延迟加载 BlockSuiteEditor
    - 配置 Vite 代码分割
    - 实现加载占位符
    - _Requirements: 10.3_

  - [ ] 14.2 优化渲染性能
    - 使用 React.memo 避免不必要重渲染
    - 实现虚拟滚动（如需要）
    - 优化 debounce 和 throttle
    - _Requirements: 10.2, 10.4_

  - [ ]* 14.3 编写性能测试
    - 测试文档打开时间 < 500ms（10,000 字符以下）
    - 测试保存操作 < 200ms
    - 测试内存使用（切换 10 个文档后增长 < 50MB）
    - 测试打包大小（BlockSuite 代码 < 500KB gzipped）
    - _Requirements: 10.1, 10.5_

- [ ] 15. 协作基础设施准备
  - [ ] 15.1 配置 Yjs 文档管理
    - 确保使用 Yjs 作为底层存储
    - 实现文档快照功能
    - 实现撤销/重做
    - 预留协作 provider 接口
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ]* 15.2 编写并发编辑属性测试
    - **Property 6: Concurrent Edits Are Handled Correctly**
    - **Validates: Requirements 9.4, 9.5**
    - 生成随机编辑操作序列
    - 以不同顺序应用
    - 验证最终状态一致（CRDT 语义）
    - 运行 100 次迭代
    - _Requirements: 9.4, 9.5_

  - [ ]* 15.3 编写撤销/重做单元测试
    - 测试撤销操作
    - 测试重做操作
    - 测试操作历史管理
    - _Requirements: 9.4_

- [ ] 16. 端到端集成测试
  - [ ]* 16.1 编写文档生命周期集成测试
    - 使用 Playwright 测试完整流程
    - 创建新文档
    - 编辑内容
    - 保存
    - 关闭
    - 重新打开
    - 验证内容一致
    - _Requirements: 2.2, 2.3, 4.1, 4.2, 4.3_

  - [ ]* 16.2 编写编辑器交互集成测试
    - 测试块操作（添加、删除、移动）
    - 测试富文本格式化
    - 测试图片上传
    - 测试撤销/重做
    - _Requirements: 5.1, 5.2, 6.1, 8.1, 9.4_

  - [ ]* 16.3 编写错误恢复集成测试
    - 模拟网络错误
    - 验证错误提示
    - 验证重试机制
    - 验证本地备份
    - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [ ] 17. 最终 Checkpoint - 完整性验证
  - 运行完整测试套件
  - 验证代码覆盖率 >= 70%
  - 手动测试所有功能
  - 性能基准测试
  - 浏览器兼容性测试
  - 准备发布文档
  - 如有问题，询问用户

- [ ] 18. 文档和清理
  - [ ] 18.1 更新项目文档
    - 更新 README 说明 BlockSuite 集成
    - 添加开发者指南
    - 添加 API 文档
    - 更新架构图
    - _Requirements: 14.1, 14.2, 14.3_

  - [ ] 18.2 代码清理
    - 移除未使用的旧编辑器代码（如果完全迁移）
    - 清理未使用的依赖
    - 优化导入语句
    - 添加代码注释
    - _Requirements: 14.4_

## Notes

- 标记为 `*` 的任务是可选的测试任务，可以跳过以加快 MVP 开发
- 每个任务都引用了具体的需求编号以确保可追溯性
- Checkpoint 任务确保增量验证和用户反馈
- 属性测试使用 fast-check 库，每个测试运行 100 次迭代
- 单元测试使用 Vitest，集成测试使用 Playwright
- 实施应该按顺序进行，确保每个阶段完成后再进入下一阶段
