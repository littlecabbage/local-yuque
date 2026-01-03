# BlockSuite 富文本和代码块功能

本文档说明 BlockSuite 编辑器中可用的富文本格式化和代码块功能。

## 富文本格式化

### 支持的内联格式

BlockSuite 编辑器支持以下内联文本格式：

1. **粗体** - 使文本加粗显示
2. *斜体* - 使文本倾斜显示
3. <u>下划线</u> - 在文本下方添加下划线
4. ~~删除线~~ - 在文本中间添加删除线
5. `代码` - 将文本显示为内联代码

### 键盘快捷键

| 格式 | Windows/Linux | macOS |
|------|---------------|-------|
| 粗体 | Ctrl + B | Cmd + B |
| 斜体 | Ctrl + I | Cmd + I |
| 下划线 | Ctrl + U | Cmd + U |
| 删除线 | Ctrl + Shift + S | Cmd + Shift + S |
| 内联代码 | Ctrl + E | Cmd + E |
| 链接 | Ctrl + K | Cmd + K |

### 格式化工具栏

当你选中文本时，会自动显示格式化工具栏，包含以下选项：
- 粗体按钮
- 斜体按钮
- 下划线按钮
- 删除线按钮
- 代码按钮
- 链接按钮

### 链接功能

1. **创建链接**：
   - 选中文本
   - 按 Ctrl/Cmd + K 或点击链接按钮
   - 输入 URL
   - 按 Enter 确认

2. **编辑链接**：
   - 点击已有链接
   - 在弹出的工具栏中点击编辑
   - 修改 URL
   - 按 Enter 确认

3. **删除链接**：
   - 点击链接
   - 在弹出的工具栏中点击删除链接按钮

## 代码块功能

### 插入代码块

有三种方式插入代码块：

1. **斜杠命令**：
   - 输入 `/code` 或 `/代码块`
   - 从菜单中选择"代码块"

2. **Markdown 语法**：
   - 输入三个反引号 ` ``` `
   - 自动转换为代码块

3. **块菜单**：
   - 点击行首的 + 按钮
   - 选择"代码块"

### 语言选择

代码块支持以下编程语言的语法高亮：

**Web 开发**：
- JavaScript
- TypeScript
- HTML
- CSS / SCSS
- JSON
- GraphQL

**后端语言**：
- Python
- Java
- C / C++
- C#
- Go
- Rust
- PHP
- Ruby
- Swift
- Kotlin

**脚本和配置**：
- Bash / Shell
- PowerShell
- YAML
- Markdown
- SQL
- Dockerfile
- XML

### 代码块功能

1. **语法高亮**：
   - 自动根据选择的语言进行语法高亮
   - 支持 30+ 种编程语言

2. **行号显示**：
   - 默认显示行号
   - 便于引用特定代码行

3. **代码复制**：
   - 鼠标悬停在代码块上
   - 点击右上角的复制按钮
   - 一键复制整个代码块

4. **保持格式**：
   - 自动保留缩进
   - 保持原始格式
   - 支持 Tab 键缩进

### 代码块快捷键

| 操作 | 快捷键 |
|------|--------|
| 插入代码块 | 输入 `/code` |
| 退出代码块 | Ctrl/Cmd + Enter |
| 缩进 | Tab |
| 取消缩进 | Shift + Tab |

## 使用示例

### 示例 1：格式化文本

```
这是**粗体文本**，这是*斜体文本*，这是`内联代码`。
```

### 示例 2：创建链接

```
访问 [BlockSuite 官网](https://blocksuite.io) 了解更多信息。
```

### 示例 3：插入代码块

```javascript
function hello() {
  console.log('Hello, BlockSuite!');
}
```

## 技术实现

### 配置文件

富文本和代码块功能的配置位于 `frontend/src/config/blocksuiteConfig.ts`。

### 默认启用的功能

- ✅ 所有内联格式（粗体、斜体、下划线、删除线、代码）
- ✅ 格式化工具栏
- ✅ 键盘快捷键
- ✅ 链接创建和编辑
- ✅ 代码块插入
- ✅ 语法高亮
- ✅ 行号显示
- ✅ 代码复制功能

### 自定义配置

如需修改配置，编辑 `blocksuiteConfig.ts` 文件：

```typescript
export const RICH_TEXT_CONFIG = {
  enableBold: true,
  enableItalic: true,
  // ... 其他配置
};

export const CODE_BLOCK_CONFIG = {
  showLineNumbers: true,
  enableCopy: true,
  defaultLanguage: 'javascript',
};
```

## 注意事项

1. **浏览器兼容性**：
   - 所有功能在现代浏览器中都能正常工作
   - 推荐使用 Chrome、Firefox、Safari 或 Edge 最新版本

2. **性能考虑**：
   - 大型代码块（>1000 行）可能影响性能
   - 建议将超大代码分割为多个较小的代码块

3. **Markdown 兼容性**：
   - 所有富文本格式都可以导出为标准 Markdown
   - 代码块会保留语言标识符

## 相关文档

- [BlockSuite 官方文档](https://blocksuite.io)
- [块操作功能](./BLOCK_OPERATIONS.md)
- [编辑器测试](./EDITOR_TESTS_README.md)
