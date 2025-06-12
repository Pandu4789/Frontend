import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { format, parseISO, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { FaDownload, FaTimes } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './PoojaStatsPage.css';

const API_BASE = "http://localhost:8080";

// --- NEW: The Modal for selecting the report's date range ---
const ReportFilterModal = ({ onClose, onGenerate }) => {
    const [reportType, setReportType] = useState('month'); // 'month', 'year', 'range'
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;

    const handleGenerateClick = () => {
        let start, end;

        switch (reportType) {
            case 'month':
                start = startOfMonth(selectedDate);
                end = endOfMonth(selectedDate);
                break;
            case 'year':
                start = startOfYear(selectedDate);
                end = endOfYear(selectedDate);
                break;
            case 'range':
                if (!startDate || !endDate) {
                    toast.error("Please select both a start and end date for the range.");
                    return;
                }
                start = startDate;
                end = endDate;
                break;
            default:
                toast.error("Invalid report type selected.");
                return;
        }
        
        // Pass the calculated start and end dates to the parent
        onGenerate(format(start, 'yyyy-MM-dd'), format(end, 'yyyy-MM-dd'));
        onClose();
    };

    return (
        <div className="am-modal-backdrop">
            <div className="am-modal-content small">
                <div className="am-modal-header">
                    <h2>Generate Detailed Report</h2>
                    <button className="am-modal-close-btn" onClick={onClose}><FaTimes /></button>
                </div>
                <div className="report-filter-body">
                    <p>Select the time period for your report.</p>
                    <div className="report-type-selector">
                        <label><input type="radio" value="month" checked={reportType === 'month'} onChange={(e) => setReportType(e.target.value)} /> Month</label>
                        <label><input type="radio" value="year" checked={reportType === 'year'} onChange={(e) => setReportType(e.target.value)} /> Year</label>
                        <label><input type="radio" value="range" checked={reportType === 'range'} onChange={(e) => setReportType(e.target.value)} /> Custom Range</label>
                    </div>

                    <div className="date-picker-container">
                        {reportType === 'month' && <DatePicker selected={selectedDate} onChange={date => setSelectedDate(date)} dateFormat="MMMM, yyyy" showMonthYearPicker />}
                        {reportType === 'year' && <DatePicker selected={selectedDate} onChange={date => setSelectedDate(date)} dateFormat="yyyy" showYearPicker />}
                        {reportType === 'range' && <DatePicker selectsRange={true} startDate={startDate} endDate={endDate} onChange={(update) => setDateRange(update)} isClearable={true} placeholderText="Select start and end dates"/>}
                    </div>
                </div>
                <div className="am-modal-footer">
                    <button className="am-modal-btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="am-modal-btn-primary" onClick={handleGenerateClick}>Generate Report</button>
                </div>
            </div>
        </div>
    );
};


const PoojaStatsPage = () => {
    // Stats and loading state are no longer needed here if the page is just for downloading
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    const handleDownloadReport = (startDate, endDate) => {
        const priestId = localStorage.getItem('userId');
        if (!priestId) {
            toast.error("Priest ID not found.");
            return;
        }
        
        // Construct the URL with query parameters
        const reportUrl = `${API_BASE}/api/reports/priest/${priestId}/detailed-pdf?startDate=${startDate}&endDate=${endDate}`;

        window.open(reportUrl, '_blank');
        toast.info("Your report is being generated and will download shortly...");
    };

    return (
        <div className="stats-page-container">
            <ToastContainer position="bottom-right" autoClose={3000} theme="colored"/>
            {isReportModalOpen && <ReportFilterModal onClose={() => setIsReportModalOpen(false)} onGenerate={handleDownloadReport} />}
            
            <div className="pd-section-header">
                <h1 className="stats-page-title">Pooja & Financial Reports</h1>
            </div>

            <div className="report-description-card">
                <h3>Generate Detailed Reports</h3>
                <p>
                    Create and download detailed PDF reports for your bookings and appointments.
                    You can filter your reports by month, year, or a custom date range to get the exact information you need for your records.
                </p>
                <button className="pd-action-btn primary large" onClick={() => setIsReportModalOpen(true)}>
                    <FaDownload /> Generate New Report
                </button>
            </div>
        </div>
    );
};

export default PoojaStatsPage;