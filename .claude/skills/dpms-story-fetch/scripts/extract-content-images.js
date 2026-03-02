/**
 * 步骤3: 提取需求内容和图片脚本（保留原始位置）
 * 从DPMS需求详情页提取：富文本内容、图片信息、用于分析图片位置
 */
(function() {
    // 获取富文本编辑器内容，保留图片位置
    const richTextEl = document.querySelector('#richTextComponent') || document.querySelector('.simditor-body');
    if (!richTextEl) {
        return JSON.stringify({ error: '无法找到富文本内容区域' });
    }

    // 提取所有图片及其在文档中的位置信息
    const imagesInfo = [];
    const walker = document.createTreeWalker(richTextEl, NodeFilter.SHOW_ALL, null, false);
    let node;
    let imgIndex = 0;
    while (node = walker.nextNode()) {
        if (node.nodeType === 1 && node.tagName === 'IMG') {
            const src = node.getAttribute('src');
            if (!src) continue;

            // 过滤头像等非需求图片
            if (src.includes('profile') || src.includes('avatar')) continue;

            const fullUrl = src.startsWith('http') ? src : 'http://dpms.weoa.com' + src;
            // 使用更友好的文件名
            const fileName = src.includes('image.png') ? 'image_' + (imagesInfo.length + 1) + '.png' : src.split('/').pop();

            imagesInfo.push({
                index: ++imgIndex,
                src: src,
                fullUrl: fullUrl,
                fileName: fileName
            });
        }
    }

    // 获取完整的HTML内容（用于分析图片位置）
    const contentHtml = richTextEl.innerHTML;

    // 获取纯文本内容（保留换行）
    let contentText = '';
    richTextEl.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, br').forEach(el => {
        contentText += el.textContent + '\n';
    });

    return JSON.stringify({
        imagesInfo: imagesInfo,
        imagesCount: imagesInfo.length,
        contentHtml: contentHtml.substring(0, 20000),
        contentText: contentText.substring(0, 8000)
    }, null, 2);
})();