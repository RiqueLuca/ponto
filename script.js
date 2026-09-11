class PontoApp {
    constructor() {
        this.punches = this.loadData('punches') || {};
        this.settings = this.loadData('settings') || {
            workdayHours: 8,
            breakDuration: 60
        };
        this.currentStatus = 'out'; // 'in' or 'out'
        this.editingDay = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateCurrentTime();
        this.updateCurrentDate();
        this.updateTodayView();
        this.loadSettings();
        this.generateMonthFilter();

        setInterval(() => this.updateCurrentTime(), 1000);

        this.updateReports();
        setInterval(() => this.updateReports(), 60000);
    }

    setupEventListeners() {
        // Punch button
        document.getElementById('punchBtn').addEventListener('click', () => this.handlePunch());

        // Tabs
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Edit modal
        document.getElementById('editTodayBtn').addEventListener('click', () => this.openEditModal('today'));
        document.querySelector('.modal-close').addEventListener('click', () => this.closeEditModal());
        document.getElementById('cancelEditBtn').addEventListener('click', () => this.closeEditModal());
        document.getElementById('saveEditBtn').addEventListener('click', () => this.saveEdits());

        // Clear today
        document.getElementById('clearTodayBtn').addEventListener('click', () => this.clearDay('today'));

        // History filters
        document.getElementById('historyDateFilter').addEventListener('change', () => this.updateHistoryView());
        document.getElementById('monthFilter').addEventListener('change', () => this.updateHistoryView());

        // Settings
        document.getElementById('workdayHours').addEventListener('change', (e) => {
            this.settings.workdayHours = parseFloat(e.target.value);
            this.saveData('settings', this.settings);
            this.updateReports();
        });

        document.getElementById('breakDuration').addEventListener('change', (e) => {
            this.settings.breakDuration = parseInt(e.target.value);
            this.saveData('settings', this.settings);
        });

        // Export/Import
        document.getElementById('exportDataBtn').addEventListener('click', () => this.exportData());
        document.getElementById('importDataBtn').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });
        document.getElementById('importFile').addEventListener('change', (e) => this.importData(e));

        // Clear all
        document.getElementById('clearAllBtn').addEventListener('click', () => this.clearAllData());

        // Export CSV
        document.getElementById('exportCsvBtn').addEventListener('click', () => this.exportCSV());

        // Print
        document.getElementById('printReportBtn').addEventListener('click', () => this.printReport());
    }

    handlePunch() {
        const today = this.getToday();
        if (!this.punches[today]) {
            this.punches[today] = [];
        }

        const now = new Date();
        const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

        this.punches[today].push({
            time: time,
            timestamp: now.getTime(),
            type: this.currentStatus === 'out' ? 'in' : 'out'
        });

        this.currentStatus = this.currentStatus === 'out' ? 'in' : 'out';
        this.saveData('punches', this.punches);

        this.updateTodayView();
        this.updateReports();
        this.showToast(`Marcação de ${this.currentStatus === 'in' ? 'saída' : 'entrada'} registrada!`, 'success');
    }

    updateCurrentTime() {
        const now = new Date();
        const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        document.getElementById('currentTime').textContent = time;

        // Update punch button
        const today = this.getToday();
        const todayPunches = this.punches[today] || [];

        if (todayPunches.length > 0) {
            const lastPunch = todayPunches[todayPunches.length - 1];
            document.getElementById('lastPunch').textContent = lastPunch.time;
            document.getElementById('punchBtnTime').textContent = `Última: ${lastPunch.time}`;
        }
    }

    updateCurrentDate() {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const today = new Date();
        const dateString = today.toLocaleDateString('pt-BR', options);
        document.getElementById('currentDate').textContent = dateString.charAt(0).toUpperCase() + dateString.slice(1);
    }

    updateTodayView() {
        const today = this.getToday();
        const todayPunches = this.punches[today] || [];

        const container = document.getElementById('todayPunches');

        if (todayPunches.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>Nenhuma marcação registrada hoje</p></div>';
            document.getElementById('workedHours').textContent = '0h 0min';
            this.updateStatusIndicator();
            return;
        }

        const sortedPunches = [...todayPunches].sort((a, b) => a.timestamp - b.timestamp);

        container.innerHTML = sortedPunches.map((punch, idx) => {
            const typeLabel = punch.type === 'in' ? '🔓 Entrada' : '🔒 Saída';
            const typeClass = punch.type === 'in' ? 'entry' : 'exit';

            return `
                <div class="punch-item ${typeClass}">
                    <div class="punch-info">
                        <div class="punch-time">${punch.time}</div>
                        <div class="punch-type">${typeLabel}</div>
                    </div>
                    <button class="btn-secondary" style="padding: 5px 10px; font-size: 0.85rem;"
                            onclick="app.deletePunch('${today}', ${idx})">🗑️ Deletar</button>
                </div>
            `;
        }).join('');

        const workedTime = this.calculateWorkedTime(todayPunches);
        document.getElementById('workedHours').textContent = `${workedTime.hours}h ${workedTime.minutes}min`;

        this.updateStatusIndicator();
    }

    updateStatusIndicator() {
        const today = this.getToday();
        const todayPunches = this.punches[today] || [];
        const indicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');
        const btn = document.getElementById('punchBtn');

        if (todayPunches.length === 0) {
            indicator.classList.remove('working', 'break');
            statusText.textContent = 'Pronto para iniciar';
            btn.classList.add('btn-in');
            btn.classList.remove('btn-out');
            btn.querySelector('.btn-label').textContent = 'ENTRADA';
            this.currentStatus = 'out';
        } else {
            const lastPunch = todayPunches[todayPunches.length - 1];
            if (lastPunch.type === 'in') {
                indicator.classList.add('working');
                indicator.classList.remove('break');
                statusText.textContent = 'Você está trabalhando';
                btn.classList.remove('btn-in');
                btn.classList.add('btn-out');
                btn.querySelector('.btn-label').textContent = 'SAÍDA';
                this.currentStatus = 'in';
            } else {
                indicator.classList.remove('working');
                indicator.classList.add('break');
                statusText.textContent = 'Você está fora';
                btn.classList.add('btn-in');
                btn.classList.remove('btn-out');
                btn.querySelector('.btn-label').textContent = 'ENTRADA';
                this.currentStatus = 'out';
            }
        }
    }

    calculateWorkedTime(punches) {
        if (punches.length === 0) return { hours: 0, minutes: 0 };

        let totalMinutes = 0;
        for (let i = 0; i < punches.length - 1; i += 2) {
            if (punches[i].type === 'in' && punches[i + 1] && punches[i + 1].type === 'out') {
                const diff = punches[i + 1].timestamp - punches[i].timestamp;
                totalMinutes += Math.floor(diff / 60000);
            }
        }

        // If last punch is 'in', add time until now
        if (punches.length > 0 && punches[punches.length - 1].type === 'in') {
            const now = new Date().getTime();
            const diff = now - punches[punches.length - 1].timestamp;
            totalMinutes += Math.floor(diff / 60000);
        }

        // Subtract break
        totalMinutes -= this.settings.breakDuration;
        if (totalMinutes < 0) totalMinutes = 0;

        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        return { hours, minutes };
    }

    switchTab(tabName) {
        // Remove active from all tabs and contents
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Add active to selected
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(tabName).classList.add('active');

        if (tabName === 'history') {
            this.updateHistoryView();
        } else if (tabName === 'reports') {
            this.updateReports();
        }
    }

    updateHistoryView() {
        const dateFilter = document.getElementById('historyDateFilter').value;
        const monthFilter = document.getElementById('monthFilter').value;

        const container = document.getElementById('historyContent');
        let filteredDays = Object.keys(this.punches).sort().reverse();

        if (dateFilter) {
            filteredDays = filteredDays.filter(day => day === dateFilter);
        } else if (monthFilter) {
            filteredDays = filteredDays.filter(day => day.startsWith(monthFilter));
        }

        if (filteredDays.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>Nenhum registro encontrado</p></div>';
            return;
        }

        const html = filteredDays.map(day => {
            const dayPunches = this.punches[day];
            const workedTime = this.calculateWorkedTime(dayPunches);
            const dayDate = new Date(day + 'T00:00:00');
            const dayName = dayDate.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });

            const punchesHtml = dayPunches.map(p => {
                const typeLabel = p.type === 'in' ? '🔓 Entrada' : '🔒 Saída';
                return `<div style="margin: 5px 0; font-size: 0.9rem;"><strong>${p.time}</strong> - ${typeLabel}</div>`;
            }).join('');

            return `
                <div class="history-day">
                    <div class="history-day-header">
                        <span>${dayName}</span>
                        <span class="day-hours">${workedTime.hours}h ${workedTime.minutes}min</span>
                    </div>
                    <div style="background: var(--bg-white); padding: 15px; border-radius: 6px;">
                        ${punchesHtml}
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    generateMonthFilter() {
        const monthFilter = document.getElementById('monthFilter');
        const months = new Set();

        Object.keys(this.punches).forEach(day => {
            const month = day.substring(0, 7); // YYYY-MM
            months.add(month);
        });

        const sortedMonths = Array.from(months).sort().reverse();
        sortedMonths.forEach(month => {
            const option = document.createElement('option');
            option.value = month;
            const [year, monthNum] = month.split('-');
            const monthName = new Date(year, monthNum - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
            option.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);
            monthFilter.appendChild(option);
        });
    }

    updateReports() {
        this.updateWeeklyReport();
        this.updateMonthlyReport();
        this.updateSummaryReport();
    }

    updateWeeklyReport() {
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());

        let totalMinutes = 0;
        const dayReports = [];

        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            const dateStr = this.formatDate(date);

            const dayPunches = this.punches[dateStr] || [];
            const workedTime = this.calculateWorkedTime(dayPunches);
            const dayMinutes = workedTime.hours * 60 + workedTime.minutes;
            totalMinutes += dayMinutes;

            const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' });
            dayReports.push(`
                <div class="report-row">
                    <span class="report-label">${dayName}</span>
                    <span class="report-value">${workedTime.hours}h ${workedTime.minutes}min</span>
                </div>
            `);
        }

        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const expected = this.settings.workdayHours * 5;
        const diff = hours - expected;

        const html = `
            ${dayReports.join('')}
            <div class="report-row" style="border-top: 2px solid var(--border); margin-top: 10px; padding-top: 10px;">
                <span class="report-label"><strong>Total Semana</strong></span>
                <span class="report-value"><strong>${hours}h ${minutes}min</strong></span>
            </div>
            <div class="report-row">
                <span class="report-label">Esperado</span>
                <span class="report-value" style="color: ${expected > 0 ? 'var(--success)' : 'var(--danger)'};">${expected}h</span>
            </div>
            <div class="report-row">
                <span class="report-label">Saldo</span>
                <span class="report-value" style="color: ${diff >= 0 ? 'var(--success)' : 'var(--danger)'};">${Math.abs(diff)}h ${diff >= 0 ? '✓' : '✗'}</span>
            </div>
        `;

        document.getElementById('weeklyReport').innerHTML = html;
    }

    updateMonthlyReport() {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        let totalMinutes = 0;
        let workingDays = 0;

        for (let date = new Date(firstDay); date <= lastDay; date.setDate(date.getDate() + 1)) {
            const dayOfWeek = date.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip weekends

            const dateStr = this.formatDate(date);
            const dayPunches = this.punches[dateStr] || [];
            const workedTime = this.calculateWorkedTime(dayPunches);
            const dayMinutes = workedTime.hours * 60 + workedTime.minutes;

            if (dayPunches.length > 0) {
                totalMinutes += dayMinutes;
                workingDays++;
            }
        }

        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const expected = this.settings.workdayHours * workingDays;
        const diff = hours - expected;

        const html = `
            <div class="report-row">
                <span class="report-label">Total Horas</span>
                <span class="report-value">${hours}h ${minutes}min</span>
            </div>
            <div class="report-row">
                <span class="report-label">Dias Trabalhados</span>
                <span class="report-value">${workingDays}</span>
            </div>
            <div class="report-row">
                <span class="report-label">Esperado</span>
                <span class="report-value">${expected}h</span>
            </div>
            <div class="report-row">
                <span class="report-label">Saldo</span>
                <span class="report-value" style="color: ${diff >= 0 ? 'var(--success)' : 'var(--danger)'};">${Math.abs(diff)}h ${diff >= 0 ? '✓' : '✗'}</span>
            </div>
        `;

        document.getElementById('monthlyReport').innerHTML = html;
    }

    updateSummaryReport() {
        let totalMinutes = 0;
        let totalDays = 0;

        Object.keys(this.punches).forEach(day => {
            const dayPunches = this.punches[day];
            if (dayPunches.length > 0) {
                const workedTime = this.calculateWorkedTime(dayPunches);
                totalMinutes += workedTime.hours * 60 + workedTime.minutes;
                totalDays++;
            }
        });

        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const avgHours = totalDays > 0 ? Math.floor((hours * 60 + minutes) / totalDays / 60) : 0;
        const avgMinutes = totalDays > 0 ? Math.floor((hours * 60 + minutes) / totalDays % 60) : 0;

        const html = `
            <div class="report-row">
                <span class="report-label">Total de Horas</span>
                <span class="report-value">${hours}h ${minutes}min</span>
            </div>
            <div class="report-row">
                <span class="report-label">Total de Dias</span>
                <span class="report-value">${totalDays}</span>
            </div>
            <div class="report-row">
                <span class="report-label">Média Diária</span>
                <span class="report-value">${avgHours}h ${avgMinutes}min</span>
            </div>
            <div class="report-row">
                <span class="report-label">Total de Marcações</span>
                <span class="report-value">${Object.values(this.punches).reduce((sum, arr) => sum + arr.length, 0)}</span>
            </div>
        `;

        document.getElementById('summaryReport').innerHTML = html;
    }

    openEditModal(day) {
        this.editingDay = day === 'today' ? this.getToday() : day;
        const punches = this.punches[this.editingDay] || [];

        const modalBody = document.getElementById('editModalBody');

        if (punches.length === 0) {
            modalBody.innerHTML = '<p class="empty-state">Nenhuma marcação para editar</p>';
            document.getElementById('modal').classList.add('active');
            return;
        }

        const html = punches.map((punch, idx) => `
            <div class="edit-item">
                <label>Marcação ${idx + 1}</label>
                <input type="time" class="punch-edit-time" data-idx="${idx}" value="${punch.time.substring(0, 5)}">
            </div>
        `).join('');

        modalBody.innerHTML = html;
        document.getElementById('editModal').classList.add('active');
    }

    closeEditModal() {
        document.getElementById('editModal').classList.remove('active');
        this.editingDay = null;
    }

    saveEdits() {
        const inputs = document.querySelectorAll('.punch-edit-time');
        const updatedPunches = [];

        inputs.forEach((input, idx) => {
            const [hours, minutes] = input.value.split(':');
            const time = `${hours}:${minutes}:00`;
            const originalPunch = this.punches[this.editingDay][idx];
            updatedPunches.push({
                time: time,
                timestamp: new Date(`${this.editingDay}T${time}`).getTime(),
                type: originalPunch.type
            });
        });

        this.punches[this.editingDay] = updatedPunches;
        this.saveData('punches', this.punches);
        this.closeEditModal();
        this.updateTodayView();
        this.updateReports();
        this.showToast('Marcações atualizadas!', 'success');
    }

    deletePunch(day, idx) {
        this.punches[day].splice(idx, 1);
        if (this.punches[day].length === 0) {
            delete this.punches[day];
        }
        this.saveData('punches', this.punches);
        this.updateTodayView();
        this.updateReports();
        this.showToast('Marcação deletada!', 'success');
    }

    clearDay(day) {
        const targetDay = day === 'today' ? this.getToday() : day;
        if (confirm(`Tem certeza que deseja limpar todas as marcações de ${targetDay}?`)) {
            delete this.punches[targetDay];
            this.saveData('punches', this.punches);
            this.updateTodayView();
            this.updateReports();
            this.showToast('Dia limpo!', 'success');
        }
    }

    exportData() {
        const data = {
            punches: this.punches,
            settings: this.settings,
            exportDate: new Date().toISOString()
        };

        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ponto-export-${this.getToday()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('Dados exportados!', 'success');
    }

    importData(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                this.punches = data.punches || {};
                this.settings = data.settings || this.settings;
                this.saveData('punches', this.punches);
                this.saveData('settings', this.settings);
                this.updateTodayView();
                this.updateReports();
                this.generateMonthFilter();
                this.loadSettings();
                this.showToast('Dados importados com sucesso!', 'success');
            } catch (error) {
                this.showToast('Erro ao importar dados!', 'error');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    }

    exportCSV() {
        let csv = 'Data,Hora,Tipo\n';

        Object.keys(this.punches).sort().forEach(day => {
            this.punches[day].forEach(punch => {
                const type = punch.type === 'in' ? 'Entrada' : 'Saída';
                csv += `${day},${punch.time},${type}\n`;
            });
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ponto-export-${this.getToday()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('Arquivo CSV exportado!', 'success');
    }

    printReport() {
        window.print();
    }

    clearAllData() {
        if (confirm('⚠️ Tem certeza? Esta ação não pode ser desfeita. Todos os dados serão deletados permanentemente.')) {
            if (confirm('Tem CERTEZA? Clique novamente para confirmar.')) {
                this.punches = {};
                this.settings = {
                    workdayHours: 8,
                    breakDuration: 60
                };
                this.saveData('punches', this.punches);
                this.saveData('settings', this.settings);
                this.updateTodayView();
                this.updateReports();
                this.loadSettings();
                this.showToast('Todos os dados foram deletados!', 'success');
            }
        }
    }

    loadSettings() {
        document.getElementById('workdayHours').value = this.settings.workdayHours;
        document.getElementById('breakDuration').value = this.settings.breakDuration;
    }

    getToday() {
        const today = new Date();
        return this.formatDate(today);
    }

    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast show ${type}`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    saveData(key, data) {
        try {
            localStorage.setItem(`ponto_${key}`, JSON.stringify(data));
        } catch (error) {
            console.error('Erro ao salvar dados:', error);
            this.showToast('Erro ao salvar dados!', 'error');
        }
    }

    loadData(key) {
        try {
            const data = localStorage.getItem(`ponto_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            return null;
        }
    }
}

// Initialize app
const app = new PontoApp();
