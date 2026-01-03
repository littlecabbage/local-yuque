#!/usr/bin/env python3
"""
知识库管理功能验证脚本
用于测试所有知识库管理API端点的功能
"""

import requests
import json
import time

# API基础URL
BASE_URL = "http://localhost:8000"

class KBTester:
    def __init__(self, base_url=BASE_URL):
        self.base_url = base_url
        self.created_nodes = []
        
    def run_all_tests(self):
        """运行所有测试"""
        print("🚀 开始知识库管理功能验证...")
        
        try:
            # 1. 测试获取知识库树形结构
            self.test_get_tree()
            
            # 2. 测试创建知识库
            kb_id = self.test_create_kb()
            
            # 3. 测试创建文件夹
            folder_id = self.test_create_folder(kb_id)
            
            # 4. 测试创建文档
            doc_id = self.test_create_doc(folder_id)
            
            # 5. 测试重命名功能
            self.test_rename_node(doc_id)
            
            # 6. 测试保存文档内容
            self.test_save_content(doc_id)
            
            # 7. 测试搜索功能
            self.test_search()
            
            # 8. 测试获取文档内容
            self.test_get_content(doc_id)
            
            # 9. 测试删除功能
            self.test_delete_node(doc_id)
            
            print("\n✅ 所有测试通过！知识库管理功能正常工作")
            
        except Exception as e:
            print(f"\n❌ 测试失败: {e}")
            return False
            
        return True
    
    def test_get_tree(self):
        """测试获取知识库树形结构"""
        print("\n📋 测试获取知识库树形结构...")
        response = requests.get(f"{self.base_url}/api/kb")
        
        if response.status_code == 200:
            tree = response.json()
            print(f"✅ 成功获取树形结构，共{len(tree)}个顶级节点")
            return True
        else:
            raise Exception(f"获取树形结构失败: {response.status_code}")
    
    def test_create_kb(self):
        """测试创建知识库"""
        print("\n📚 测试创建知识库...")
        data = {
            "parentId": None,
            "title": "测试知识库",
            "type": "kb"
        }
        
        response = requests.post(
            f"{self.base_url}/api/create",
            json=data
        )
        
        if response.status_code == 200:
            result = response.json()
            kb_id = result["node"]["id"]
            self.created_nodes.append(kb_id)
            print(f"✅ 成功创建知识库: {kb_id}")
            return kb_id
        else:
            raise Exception(f"创建知识库失败: {response.status_code}")
    
    def test_create_folder(self, parent_id):
        """测试创建文件夹"""
        print("\n📁 测试创建文件夹...")
        data = {
            "parentId": parent_id,
            "title": "测试文件夹",
            "type": "folder"
        }
        
        response = requests.post(
            f"{self.base_url}/api/create",
            json=data
        )
        
        if response.status_code == 200:
            result = response.json()
            folder_id = result["node"]["id"]
            self.created_nodes.append(folder_id)
            print(f"✅ 成功创建文件夹: {folder_id}")
            return folder_id
        else:
            raise Exception(f"创建文件夹失败: {response.status_code}")
    
    def test_create_doc(self, parent_id):
        """测试创建文档"""
        print("\n📝 测试创建文档...")
        data = {
            "parentId": parent_id,
            "title": "测试文档",
            "type": "doc"
        }
        
        response = requests.post(
            f"{self.base_url}/api/create",
            json=data
        )
        
        if response.status_code == 200:
            result = response.json()
            doc_id = result["node"]["id"]
            self.created_nodes.append(doc_id)
            print(f"✅ 成功创建文档: {doc_id}")
            return doc_id
        else:
            raise Exception(f"创建文档失败: {response.status_code}")
    
    def test_rename_node(self, node_id):
        """测试重命名功能"""
        print("\n✏️ 测试重命名功能...")
        data = {
            "title": "重命名后的文档"
        }
        
        response = requests.post(
            f"{self.base_url}/api/rename/{node_id}",
            json=data
        )
        
        if response.status_code == 200:
            print(f"✅ 成功重命名节点: {node_id}")
            return True
        else:
            raise Exception(f"重命名失败: {response.status_code}")
    
    def test_save_content(self, doc_id):
        """测试保存文档内容"""
        print("\n💾 测试保存文档内容...")
        content = """# 测试文档

这是一个测试文档，用于验证知识库管理功能。

## 功能测试

- ✅ 创建功能
- ✅ 重命名功能
- ✅ 保存内容功能
- ✅ 搜索功能
- ✅ 删除功能
"""
        
        data = {
            "content": content
        }
        
        response = requests.post(
            f"{self.base_url}/api/files/{doc_id}",
            json=data
        )
        
        if response.status_code == 200:
            print(f"✅ 成功保存文档内容: {doc_id}")
            return True
        else:
            raise Exception(f"保存内容失败: {response.status_code}")
    
    def test_get_content(self, doc_id):
        """测试获取文档内容"""
        print("\n📖 测试获取文档内容...")
        response = requests.get(f"{self.base_url}/api/files/{doc_id}")
        
        if response.status_code == 200:
            content = response.json()["content"]
            print(f"✅ 成功获取文档内容，长度: {len(content)}字符")
            return True
        else:
            raise Exception(f"获取内容失败: {response.status_code}")
    
    def test_search(self):
        """测试搜索功能"""
        print("\n🔍 测试搜索功能...")
        
        # 等待一下确保内容已保存
        time.sleep(1)
        
        response = requests.get(f"{self.base_url}/api/search?q=测试")
        
        if response.status_code == 200:
            results = response.json()
            print(f"✅ 成功搜索到{len(results)}个结果")
            
            # 打印搜索结果
            for result in results:
                print(f"  - {result['title']} ({result['type']})")
            
            return True
        else:
            raise Exception(f"搜索失败: {response.status_code}")
    
    def test_delete_node(self, node_id):
        """测试删除功能"""
        print("\n🗑️ 测试删除功能...")
        response = requests.post(f"{self.base_url}/api/delete/{node_id}")
        
        if response.status_code == 200:
            print(f"✅ 成功删除节点: {node_id}")
            return True
        else:
            raise Exception(f"删除失败: {response.status_code}")
    
    def cleanup(self):
        """清理测试数据"""
        print("\n🧹 清理测试数据...")
        for node_id in reversed(self.created_nodes):
            try:
                requests.post(f"{self.base_url}/api/delete/{node_id}")
                print(f"已清理: {node_id}")
            except:
                pass

if __name__ == "__main__":
    tester = KBTester()
    
    try:
        # 检查后端服务是否运行
        response = requests.get(f"{BASE_URL}/api/kb", timeout=5)
        if response.status_code != 200:
            print("❌ 后端服务未运行，请先启动后端服务")
            print("运行: cd backend && python -m main")
            exit(1)
    except requests.exceptions.RequestException:
        print("❌ 无法连接到后端服务，请确保后端已启动")
        print("运行: cd backend && python -m main")
        exit(1)
    
    # 运行测试
    success = tester.run_all_tests()
    
    # 清理测试数据
    tester.cleanup()
    
    if success:
        print("\n🎉 所有知识库管理功能验证完成！")
    else:
        print("\n💥 测试过程中出现错误")