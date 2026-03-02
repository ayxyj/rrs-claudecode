/**
 * 步骤2: 提取基础信息脚本
 * 从DPMS需求详情页提取：Story ID、标题、发布计划、业务需求、附件信息
 */
(function() {
    // 从URL中提取story ID
    const url = window.location.href;
    const storyIdMatch = url.match(/story\/detail\/(\d+)/);
    const storyId = storyIdMatch ? storyIdMatch[1] : (url.match(/detail\/(\d+)/)?.[1] || '');

    // 获取页面标题
    const title = document.querySelector('h1')?.textContent?.trim()
        || document.querySelector('.el-card__header h2')?.textContent?.trim()
        || document.title.replace(/【.*?】/, '').trim();

    // ========== 获取发布计划（从表格中提取） ==========
    // 页面表格：查找包含"所属发布计划"的行，获取该行的数据值
    // 表格格式：id | 名称 | ... | 所属发布计划 | 预计结束投产时间 | ...
    // 数据行：488061 | ... | 系统需求 | ... | RRS-FBD-26.02.2(2026-02-05) | 2026-02-28 | ...
    let releasePlan = 'release';
    const tables = document.querySelectorAll('table');
    for (const table of tables) {
        const rows = table.querySelectorAll('tr');
        for (let r = 0; r < rows.length; r++) {
            const cells = rows[r].querySelectorAll('td, th');
            // 跳过表头行（第一行），从数据行开始查找
            if (r === 0) continue;
            // 查找包含"所属发布计划"的列
            for (let i = 0; i < cells.length; i++) {
                const cellText = cells[i].textContent?.trim() || '';
                if (cellText && cellText.match(/^RRS-[A-Z]+-\d+\.\d+\.\d+/)) {
                    // 如果单元格内容匹配发布计划格式，直接使用
                    releasePlan = cellText;
                    break;
                }
            }
            if (releasePlan !== 'release') break;
        }
        if (releasePlan !== 'release') break;
    }

    // ========== 提取附件信息 ==========
    const attachments = [];
    const attachmentContainer = document.querySelector('.attachments-area')
        || document.querySelector('.detail-attachments-component')
        || document.querySelector('[class*="attachments"]');

    // 通用正则：匹配 "用户名(中文名)日期时间" 格式
    // 例如: "文件.xlsx张三(张三)2026-03-02 15:30"
    const userAndTimePattern = /[a-zA-Z0-9_\u4e00-\u9fa5]+\([^)]+\)\d{4}-\d{2}-\d{2}(?:\s*\d{2}:\d{2})?/;
    // 仅匹配时间部分：2026-03-02 或 2026-03-02 15:30
    const timeOnlyPattern = /\d{4}-\d{2}-\d{2}(?:\s*\d{2}:\d{2})?/;
    // 匹配用户名(中文名)格式
    const usernamePattern = /([a-zA-Z0-9_\u4e00-\u9fa5]+\([^)]+\))/;

    if (attachmentContainer) {
        attachmentContainer.querySelectorAll('.attachment').forEach((el, index) => {
            const link = el.querySelector('a');
            const fullText = el.textContent.trim();

            if (link) {
                const href = link.getAttribute('href');
                // 解析文件名：移除用户名和时间等后缀，保留纯文件名
                // 格式: "文件名.扩展名用户名(中文名)2026-03-02" 或 "文件名.扩展名2026-03-02"
                let fileName = fullText;
                // 先移除 "用户名(中文名)+日期时间" 格式
                fileName = fileName.replace(userAndTimePattern, '').trim();
                // 再移除仅日期时间格式
                fileName = fileName.replace(timeOnlyPattern, '').trim();

                // 解析上传人和时间
                const usernameMatch = fullText.match(usernamePattern);
                const timeMatch = fullText.match(/(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})/);

                attachments.push({
                    index: index + 1,
                    fileName: fileName || 'file_' + (index + 1),
                    downloadUrl: href.startsWith('http') ? href : 'http://dpms.weoa.com' + href,
                    username: usernameMatch ? usernameMatch[1] : '',
                    updateTime: timeMatch ? timeMatch[1] : ''
                });
            }
        });
    }

    // 备用方法：如果上述方法没找到
    if (attachments.length === 0) {
        const fileTypes = ['.txt', '.xlsx', '.xls', '.docx', '.doc', '.pdf', '.ppt', '.pptx', '.zip', '.rar'];
        document.querySelectorAll('a[href*="download"], a[href*="file"]').forEach((link, idx) => {
            const href = link.getAttribute('href');
            const text = link.textContent.trim();
            if (href && text && fileTypes.some(ext => text.toLowerCase().includes(ext))) {
                // 清理文件名：移除用户名和时间后缀
                let cleanName = text;
                cleanName = cleanName.replace(userAndTimePattern, '').trim();
                cleanName = cleanName.replace(timeOnlyPattern, '').trim();

                // 解析用户名
                const usernameMatch = text.match(usernamePattern);

                attachments.push({
                    index: idx + 1,
                    fileName: cleanName,
                    downloadUrl: href.startsWith('http') ? href : 'http://dpms.weoa.com' + href,
                    username: usernameMatch ? usernameMatch[1] : '',
                    updateTime: ''
                });
            }
        });
    }

    return JSON.stringify({
        storyId,
        title,
        url: window.location.href,
        releasePlan,
        attachmentsCount: attachments.length,
        attachments: attachments
    }, null, 2);
})();