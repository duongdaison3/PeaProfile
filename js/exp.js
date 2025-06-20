document.addEventListener('DOMContentLoaded', function () {
    // Lấy container div3 để chèn nội dung
    const experienceContainer = document.querySelector('.div3'); 
    
    // Đường dẫn tới file JSON chứa dữ liệu kinh nghiệm
    const dataUrl = '/backend/exp.json';

    async function fetchExperiences() {
        if (!experienceContainer) {
            console.error("Lỗi: Không tìm thấy phần tử .div3 để hiển thị kinh nghiệm.");
            return;
        }
        try {
            const response = await fetch(dataUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const rawData = await response.json();
            // File exp.json được xuất từ phpMyAdmin nên dữ liệu nằm trong thuộc tính `data`
            let experiences = rawData;
            if (Array.isArray(rawData)) {
                const tableObj = rawData.find(item => item.type === 'table' && item.name === 'exp');
                if (tableObj && Array.isArray(tableObj.data)) {
                    experiences = tableObj.data;
                }
            }
            displayExperiences(experiences);
        } catch (error) {
            console.error("Không thể tải dữ liệu kinh nghiệm:", error);
            experienceContainer.innerHTML = `<p class="text-red-500 col-span-full text-center p-4">Không thể tải dữ liệu kinh nghiệm. Vui lòng kiểm tra console và đảm bảo file JSON tồn tại.</p>`;
        }
    }

    function displayExperiences(experiences) {
        
        experienceContainer.innerHTML = ''; // Xóa nội dung cũ
    
        if (!experiences || experiences.length === 0) {
            experienceContainer.innerHTML = `<p class="text-gray-600 col-span-full text-center p-4">Chưa có kinh nghiệm nào được ghi nhận.</p>`;
            return;
        }
    
        experiences.forEach(exp => {
            const startDate = exp.StartDate ? new Date(exp.StartDate).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit' }) : 'N/A';
            const endDate = exp.EndDate ? new Date(exp.EndDate).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit' }) : 'Hiện tại';
    
            let workItemsHtml = '<li>Chưa có mô tả công việc cụ thể.</li>';
            if (exp.Work && typeof exp.Work === 'string') {
                const workTasks = exp.Work.split(/;|\n/).map(task => task.trim()).filter(task => task);
                if (workTasks.length > 0) {
                    workItemsHtml = workTasks.map(task => `<li>${escapeHtml(task)}</li>`).join('');
                } else if (exp.Work.trim()) {
                     workItemsHtml = `<li>${escapeHtml(exp.Work.trim())}</li>`;
                }
            }

            const experienceCardHTML = `
            <div class="bg-white p-6 rounded-lg shadow-md relative overflow-hidden border border-gray-200 flex flex-col">
                <div class="flex items-start mb-6">
                    <div class="w-1/3 pr-4">
                        <p class="text-sm font-bold text-gray-600">${escapeHtml(exp.Name) || 'Vị trí công việc'}</p>
                    </div>
                    <div class="bg-teal-700 text-blue-900 py-3 px-6 rounded-md text-center w-2/3">
                        <h2 class="text-xl font-bold">${escapeHtml(exp.Company) || 'Tên công ty'}</h2>
                    </div>
                    <div class="absolute top-6 left-0 ml-[-10px] mt-[-10px] w-5 h-5 border-2 border-black rounded-full">
                        <div class="w-1 h-1 bg-black rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                    </div>
                    <div class="absolute top-6 left-0 ml-[8px] mt-[1px] w-[calc(25%-10px)] h-px bg-black"></div> 
                </div>
    
                <div class="flex mb-6 flex-grow">
                    <div class="w-1/3">
                        <p class="font-bold text-sm text-gray-700">Thời gian bắt đầu</p>
                        <p class="text-sm text-gray-600 mb-3">${startDate}</p>
                        <p class="font-bold text-sm text-gray-700 mt-2">Thời gian kết thúc</p>
                        <p class="text-sm text-gray-600">${endDate}</p>
                    </div>
                    <div class="w-2/3 pl-4 border-l border-gray-300">
                        <h3 class="text-md font-semibold mb-2 text-gray-800">Công việc cụ thể</h3>
                        <ul class="list-disc list-inside text-sm space-y-1 text-gray-700 mb-3">
                            ${workItemsHtml}
                        </ul>
                        <h3 class="text-md font-semibold mb-1 text-gray-800">Thành tích đạt được</h3>
                        <p class="text-sm text-gray-700">
                            ${escapeHtml(exp.Achieve) || 'Chưa có thông tin thành tích.'}
                        </p>
                    </div>
                </div>
    
                <div class="relative mt-auto pt-2 pb-2"> <div class="absolute inset-x-0 bottom-0 h-10 bg-orange-300 transform translate-y-1 translate-x-1 rounded-md"></div>
                    <div class="relative bg-white border border-black p-3 rounded-md text-sm text-gray-800 text-center">
                        ${escapeHtml(exp.Skill) || 'Chưa có thông tin kỹ năng.'}
                    </div>
                </div>
            </div>
            `;
    
            experienceContainer.innerHTML += experienceCardHTML;
        });
    }

    function escapeHtml(unsafe) {
        if (unsafe === null || typeof unsafe === 'undefined') {
            return '';
        }
        return unsafe
             .toString()
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }

    fetchExperiences();
});