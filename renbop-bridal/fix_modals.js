const fs = require('fs');
const path = require('path');

const dir = 'src/pages/admin';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Mẫu 1: Xử lý thay thế các class bị lỗi
    content = content.replace(
        /className="bg-white w-full max-w-\[600px\] max-h-\[90vh\] rounded-2xl shadow-2xl min-h-\[500px\] flex flex-col overflow-hidden"/g,
        'className="bg-white w-full max-w-[600px] h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"'
    );
    
    // Đề phòng trường hợp trước đó (ManageProducts có max-w-[650px])
    content = content.replace(
        /className="bg-white w-full max-w-\[650px\] max-h-\[90vh\] rounded-2xl shadow-2xl min-h-\[500px\] flex flex-col overflow-hidden"/g,
        'className="bg-white w-full max-w-[650px] h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"'
    );

    fs.writeFileSync(filePath, content, 'utf8');
});
console.log("Fixed all modals!");
