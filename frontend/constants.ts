import { FileNode } from './types';

export const INITIAL_DATA: FileNode[] = [
  {
    id: 'kb-1',
    parentId: null,
    title: '个人知识库',
    type: 'kb',
    isOpen: true,
    createdAt: Date.now(),
    children: [
      {
        id: 'folder-1',
        parentId: 'kb-1',
        title: '想法与灵感',
        type: 'folder',
        isOpen: true,
        createdAt: Date.now(),
        children: [
          {
            id: 'doc-1',
            parentId: 'folder-1',
            title: '凤凰项目',
            type: 'doc',
            createdAt: Date.now(),
            content: '# 凤凰项目\n\n这是伟大事物的开端。\n\n## 核心目标\n- [ ] 构建核心引擎\n- [ ] 设计用户界面\n- [ ] 深度集成 AI\n\n> "预测未来的最好方法就是创造它。"\n\n从这里开始记录你的想法...',
          },
          {
            id: 'doc-2',
            parentId: 'folder-1',
            title: '周会记录',
            type: 'doc',
            createdAt: Date.now(),
            content: '# 产品同步会\n\n**参会人**: 张三, 李四, 王五\n\n### 会议纪要:\n1. **发布计划**: 我们需要将发布周期缩短至两周。\n2. **设计系统**: 现有组件库需要进行一次视觉升级。\n\n### 待办事项:\n- [ ] 李四负责整理新版 UI 规范\n- [ ] 王五调研新的构建工具',
          }
        ]
      }
    ]
  },
  {
    id: 'kb-2',
    parentId: null,
    title: '技术文档',
    type: 'kb',
    isOpen: false,
    createdAt: Date.now(),
    children: [
      {
        id: 'doc-3',
        parentId: 'kb-2',
        title: 'API 参考手册',
        type: 'doc',
        createdAt: Date.now(),
        content: '# API 接口定义\n\nEndpoint: `/api/v1/users`\n\n**请求示例**:\n\n```json\n{\n  "id": 1,\n  "name": "User"\n}\n```',
      }
    ]
  }
];
