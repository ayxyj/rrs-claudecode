# -*- coding: utf-8 -*-
"""
步骤7: 文件下载脚本
用于下载DPMS需求中的附件和图片文件
"""
import urllib.request
import os
import sys
import json

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')


def download_file(url, output_path, timeout=60):
    """
    下载文件到指定路径

    Args:
        url: 文件下载URL
        output_path: 本地保存路径
        timeout: 超时时间（秒）

    Returns:
        (bool, str): 成功返回(True, None)，失败返回(False, error_message)
    """
    try:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        with urllib.request.urlopen(req, timeout=timeout) as response:
            with open(output_path, 'wb') as f:
                f.write(response.read())
        return True, None
    except Exception as e:
        return False, str(e)


def clean_filename(name):
    """
    清理文件名，移除或替换非法字符

    Args:
        name: 原始文件名

    Returns:
        str: 清理后的文件名
    """
    illegal_chars = '<>:"|?*'
    for c in illegal_chars:
        name = name.replace(c, '_')
    return name


def main():
    """主函数：用于命令行调用"""
    if len(sys.argv) < 3:
        print("用法: python download_files.py <json_manifest> <output_dir>")
        print("示例: python download_files.py '{\"attachments\":[],\"images\":[]}' ./story/test")
        sys.exit(1)

    manifest_json = sys.argv[1]
    output_dir = sys.argv[2]

    try:
        manifest = json.loads(manifest_json)
    except json.JSONDecodeError:
        print("错误: 无效的JSON格式")
        sys.exit(1)

    # 下载附件
    attachments = manifest.get('attachments', [])
    for att in attachments:
        file_name = clean_filename(att.get('fileName', f'file_{att.get("index", 1)}'))
        file_path = os.path.join(output_dir, 'attachments', file_name)
        url = att.get('downloadUrl', '')

        if url:
            success, error = download_file(url, file_path)
            if success:
                print(f"附件下载成功: {file_path}")
            else:
                print(f"附件下载失败: {error}")

    # 下载图片
    images = manifest.get('images', [])
    for img in images:
        file_name = clean_filename(img.get('fileName', f'image_{img.get("index", 1)}.png'))
        file_path = os.path.join(output_dir, 'assets', file_name)
        url = img.get('fullUrl', '')

        if url:
            success, error = download_file(url, file_path)
            if success:
                print(f"图片下载成功: {file_path}")
            else:
                print(f"图片下载失败: {error}")


if __name__ == '__main__':
    main()