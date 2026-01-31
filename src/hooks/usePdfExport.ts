import { useCallback, useState } from "react";
import jsPDF from "jspdf";

interface BlueprintData {
  title: string;
  problem: string;
  techStack: { name: string }[];
  phases: { title: string; tasks: string[]; duration: string }[];
  interviewQuestions: string[];
}

export const usePdfExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPdf = useCallback(async (blueprint: BlueprintData, targetRole: string) => {
    setIsExporting(true);
    
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let yPosition = margin;

      const addNewPageIfNeeded = (requiredSpace: number) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      // Header
      pdf.setFillColor(99, 102, 241);
      pdf.rect(0, 0, pageWidth, 40, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont("helvetica", "bold");
      pdf.text("CareerArchitect", margin, 25);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.text("Your Engineering Blueprint", pageWidth - margin - 50, 25);
      
      yPosition = 55;

      // Title
      pdf.setTextColor(30, 30, 30);
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      const titleLines = pdf.splitTextToSize(blueprint.title, contentWidth);
      pdf.text(titleLines, margin, yPosition);
      yPosition += titleLines.length * 8 + 5;

      // Target Role Badge
      pdf.setFillColor(243, 244, 246);
      pdf.roundedRect(margin, yPosition, 60, 8, 2, 2, "F");
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Target: ${targetRole}`, margin + 3, yPosition + 5.5);
      yPosition += 18;

      // Problem Statement Section
      addNewPageIfNeeded(40);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(30, 30, 30);
      pdf.text("🎯 Problem Statement", margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(80, 80, 80);
      const problemLines = pdf.splitTextToSize(blueprint.problem, contentWidth);
      problemLines.forEach((line: string) => {
        addNewPageIfNeeded(6);
        pdf.text(line, margin, yPosition);
        yPosition += 5;
      });
      yPosition += 10;

      // Tech Stack Section
      addNewPageIfNeeded(30);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(30, 30, 30);
      pdf.text("🛠️ Tech Stack", margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      const techPerRow = 3;
      const techBoxWidth = (contentWidth - 10) / techPerRow;
      blueprint.techStack.forEach((tech, index) => {
        const col = index % techPerRow;
        const row = Math.floor(index / techPerRow);
        if (col === 0 && row > 0) {
          addNewPageIfNeeded(15);
          yPosition += 12;
        }
        const xPos = margin + col * (techBoxWidth + 5);
        pdf.setFillColor(249, 250, 251);
        pdf.roundedRect(xPos, yPosition - 5, techBoxWidth - 5, 10, 2, 2, "F");
        pdf.setTextColor(60, 60, 60);
        pdf.text(tech.name, xPos + 3, yPosition + 2);
      });
      yPosition += 20;

      // Roadmap Section
      addNewPageIfNeeded(20);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(30, 30, 30);
      pdf.text("🗺️ Step-by-Step Roadmap", margin, yPosition);
      yPosition += 10;

      blueprint.phases.forEach((phase, phaseIndex) => {
        addNewPageIfNeeded(25);
        
        // Phase header
        pdf.setFillColor(99, 102, 241);
        pdf.circle(margin + 4, yPosition, 4, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(8);
        pdf.text(`${phaseIndex + 1}`, margin + 2.5, yPosition + 1.5);
        
        pdf.setTextColor(30, 30, 30);
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text(phase.title, margin + 12, yPosition + 1);
        
        pdf.setTextColor(100, 100, 100);
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");
        pdf.text(phase.duration, pageWidth - margin - 20, yPosition + 1);
        yPosition += 8;

        // Tasks
        pdf.setFontSize(9);
        pdf.setTextColor(80, 80, 80);
        phase.tasks.forEach((task) => {
          addNewPageIfNeeded(8);
          pdf.text("•", margin + 12, yPosition);
          const taskLines = pdf.splitTextToSize(task, contentWidth - 20);
          taskLines.forEach((line: string, lineIndex: number) => {
            if (lineIndex > 0) addNewPageIfNeeded(5);
            pdf.text(line, margin + 17, yPosition);
            yPosition += 4.5;
          });
        });
        yPosition += 8;
      });

      // Interview Questions Section
      addNewPageIfNeeded(30);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(30, 30, 30);
      pdf.text("💬 Mock Interview Questions", margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      blueprint.interviewQuestions.forEach((question, index) => {
        addNewPageIfNeeded(15);
        pdf.setFillColor(99, 102, 241);
        pdf.circle(margin + 3, yPosition - 1, 3, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(8);
        pdf.text(`${index + 1}`, margin + 1.5, yPosition + 0.5);
        
        pdf.setTextColor(60, 60, 60);
        pdf.setFontSize(10);
        const questionLines = pdf.splitTextToSize(question, contentWidth - 15);
        questionLines.forEach((line: string, lineIndex: number) => {
          if (lineIndex > 0) addNewPageIfNeeded(5);
          pdf.text(line, margin + 10, yPosition);
          yPosition += 5;
        });
        yPosition += 3;
      });

      // Footer
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          `Generated by CareerArchitect • Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" }
        );
      }

      // Download
      const fileName = `${blueprint.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_blueprint.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  }, []);

  return { exportToPdf, isExporting };
};
