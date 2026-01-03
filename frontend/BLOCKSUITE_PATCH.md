# BlockSuite Icon Import Fix

## 问题描述

BlockSuite 0.17.x 和 0.18.x 版本中存在一个拼写错误，导致无法正常导入：
- 错误的导入名称：`CheckBoxCkeckSolidIcon`
- 正确的导入名称：`CheckBoxCheckSolidIcon`

这个错误存在于以下文件中：
- `@blocksuite/affine-components/dist/context-menu/menu.js`
- `@blocksuite/data-view/dist/core/common/group-by/renderer/boolean-group.js`
- `@blocksuite/data-view/dist/view-presets/table/row/row-select-checkbox.js`
- `@blocksuite/data-view/dist/property-presets/checkbox/cell-renderer.js`

## 解决方案

使用 `patch-package` 创建补丁来修复这个拼写错误。

### 补丁文件

补丁文件位于 `patches/` 目录：
- `patches/@blocksuite+affine-components+0.17.18.patch`
- `patches/@blocksuite+data-view+0.17.18.patch`

### 自动应用

在 `package.json` 中添加了 `postinstall` 脚本：
```json
"postinstall": "patch-package"
```

这样在每次 `npm install` 后会自动应用补丁。

### 手动应用

如果需要手动应用补丁：
```bash
npm run postinstall
```

或者：
```bash
npx patch-package
```

## 注意事项

1. 如果升级 BlockSuite 版本，需要重新创建补丁
2. 这是一个临时解决方案，等待 BlockSuite 官方修复
3. 补丁文件应该提交到版本控制系统

## 相关链接

- BlockSuite GitHub: https://github.com/toeverything/blocksuite
- patch-package: https://github.com/ds300/patch-package
