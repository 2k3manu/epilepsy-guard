#!/bin/bash
REPORT_FILE="reports/Project_Report_PES1PG24CA269.md"
mkdir -p reports
echo '# PES UNIVERSITY' > $REPORT_FILE
echo '**Faculty of Engineering / Department of MCA**' >> $REPORT_FILE
echo -e '\n---\n' >> $REPORT_FILE
echo '# 🎓 CAPSTONE PROJECT REPORT' >> $REPORT_FILE
echo '## on' >> $REPORT_FILE
echo '# **🛡️ EpilepsyGuard: Real-Time Seizure Prediction and Monitoring System leveraging Big Data Infrastructure**' >> $REPORT_FILE
echo -e '\n### Submitted in partial fulfillment of the requirements for the award of the degree of' >> $REPORT_FILE
echo '### **Master of Computer Applications (MCA)**' >> $REPORT_FILE
echo -e '\n**By:**' >> $REPORT_FILE
echo '**Manu N M**' >> $REPORT_FILE
echo '**(PES1PG24CA269)**' >> $REPORT_FILE
echo -e '\n**Under the Guidance of:**' >> $REPORT_FILE
echo '**Mr. Dilip Kumar Maripuri**' >> $REPORT_FILE
echo '*Associate Professor, Dept. of MCA, PES University*' >> $REPORT_FILE
echo -e '\n---\n' >> $REPORT_FILE

echo '# Abstract' >> $REPORT_FILE
echo 'Epileptic seizures are unpredictable and life-threatening neurological events that require immediate medical attention. Traditional monitoring systems often lack real-time predictive capabilities, leading to delayed interventions. This project, **EpilepsyGuard**, presents a robust real-time epileptic seizure prediction and monitoring system leveraging a Big Data pipeline and Machine Learning. The system integrates IoT-simulated EEG sensors, Apache Kafka for high-throughput data ingestion, Apache Flink for low-latency stream processing, and Cassandra for distributed data storage. A Random Forest ML model is utilized to predict seizure risks with high accuracy (~92%). The system further features a secure React-based dashboard with JWT authentication, role-based access control (Doctor, Caregiver, Patient), and dynamic per-patient clinical threshold customization. A unique feature of the system is the retroactive risk recalculation, which updates historical risk distributions whenever clinical thresholds are modified. This end-to-end integration demonstrates a scalable, secure, and personalized approach to epilepsy management.' >> $REPORT_FILE

echo -e '\n# Chapter 1: Introduction\n' >> $REPORT_FILE
echo "The EpilepsyGuard system is designed to provide real-time monitoring of patients with epilepsy. Historical monitoring often required specialized clinical environments, which limited patient mobility and increased healthcare costs. By utilizing distributed systems and cloud-ready architectures, EpilepsyGuard brings clinical-grade monitoring to a broader audience." >> $REPORT_FILE

echo -e '\n# Chapter 2: Literature Survey\n' >> $REPORT_FILE
if [ -f "reports/literature_survey_full.txt" ]; then
    cat reports/literature_survey_full.txt >> $REPORT_FILE
else
    echo "Literature survey source not found." >> $REPORT_FILE
fi

echo -e '\n# Chapter 3: Software Requirement Specification (SRS)\n' >> $REPORT_FILE
echo "## 3.1 Functional Requirements" >> $REPORT_FILE
echo "- FR1: Secure Login." >> $REPORT_FILE
echo "- FR2: Real-time Vital Monitoring." >> $REPORT_FILE
echo "- FR3: Seizure Risk Detection." >> $REPORT_FILE
echo "## 3.2 Non-Functional Requirements" >> $REPORT_FILE
echo "- NFR1: Latency < 1s." >> $REPORT_FILE
echo "- NFR2: High Availability." >> $REPORT_FILE

echo -e '\n# Chapter 5: System Design\n' >> $REPORT_FILE
echo '## 5.1 Architecture Diagram' >> $REPORT_FILE
echo '![Architecture](file:///d:/MCA/EpilepsyGuard/architecture%20Diagram.png)' >> $REPORT_FILE

echo -e '\n# Chapter 8: Implementation Screenshots\n' >> $REPORT_FILE
echo '## 8.1 Secure Login' >> $REPORT_FILE
echo '![Login](file:///d:/MCA/EpilepsyGuard/reports/login_page_1766897768657.png)' >> $REPORT_FILE
echo '## 8.2 Dashboard Landing Page' >> $REPORT_FILE
echo '![Dashboard](file:///d:/MCA/EpilepsyGuard/reports/dashboard_main_1766897925456.png)' >> $REPORT_FILE
echo '## 8.3 Configuration Modal' >> $REPORT_FILE
echo '![Settings](file:///d:/MCA/EpilepsyGuard/reports/settings_orange_button_1766897944423.png)' >> $REPORT_FILE
echo '## 8.4 Emergency Risk Alert' >> $REPORT_FILE
echo '![High Risk](file:///d:/MCA/EpilepsyGuard/reports/high_risk_alert_1766897970848.png)' >> $REPORT_FILE

echo -e '\n# Appendix: Full Source Code Listing\n' >> $REPORT_FILE
for file in frontend/src/App.js backend/flask_app.js data_generator.py direct_cassandra_generator.py README.md start_demo.sh stop_all.sh restart_services_wsl.sh
do
  if [ -f "$file" ]; then
    echo -e "\n## $file\n\`\`\`" >> $REPORT_FILE
    cat "$file" >> $REPORT_FILE
    echo -e "\n\`\`\`" >> $REPORT_FILE
  fi
done

echo "Report generated at $REPORT_FILE"
