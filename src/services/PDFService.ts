
import { Match } from "../stores/historyStore";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

export class PDFService {
  public static async generateReport(match: Match): Promise<void> {
    // Lazy load jsPDF only when export is triggered (~90KB saved from initial bundle)
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const date = new Date(match.timestamp).toLocaleDateString();

    // -- CONFIGURAÇÕES DE ESTILO --
    const primaryColor = [15, 23, 42]; // Slate 900
    const accentColor = [99, 102, 241]; // Indigo 500

    // -- HEADER --
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 45, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.text("VOLLEY-SCORE PRO", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("MATCH PERFORMANCE ANALYTICS REPORT", 105, 30, { align: "center" });
    doc.text(`Match ID: ${match.id.substring(0, 12).toUpperCase()}`, 105, 36, { align: "center" });

    // -- INFOS GERAIS --
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Match Information", 20, 60);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Date: ${date}`, 20, 68);
    doc.text(`Match Duration: ${Math.round(match.durationSeconds / 60)} minutes`, 20, 74);
    doc.text(`Location: Virtual Court`, 20, 80);

    // -- PLACAR CENTRAL --
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(20, 90, 170, 30, 3, 3, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(20, 90, 170, 30, 3, 3, 'S');

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(`${match.teamAName}`, 60, 110, { align: "center" });
    doc.setFontSize(24);
    doc.text(`${match.setsA} - ${match.setsB}`, 105, 110, { align: "center" });
    doc.setFontSize(18);
    doc.text(`${match.teamBName}`, 150, 110, { align: "center" });

    // -- DETALHE DOS SETS --
    doc.setFontSize(12);
    doc.text("Sets Breakdown", 20, 135);
    doc.line(20, 137, 55, 137);

    let y = 148;
    match.sets.forEach((set, i) => {
        doc.setFillColor(255, 255, 255);
        doc.rect(25, y - 5, 160, 8, 'S');
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(`SET ${i+1}`, 30, y);
        doc.setFont("helvetica", "normal");
        doc.text(`${set.scoreA} pts`, 90, y, { align: "center" });
        doc.text("vs", 105, y, { align: "center" });
        doc.text(`${set.scoreB} pts`, 120, y, { align: "center" });
        const winner = set.winner === 'A' ? match.teamAName : match.teamBName;
        doc.setFont("helvetica", "bold");
        doc.text(`Winner: ${winner}`, 180, y, { align: "right" });
        y += 12;
    });

    // -- SCOUT SUMMARY --
    y += 10;
    doc.setFontSize(12);
    doc.text("Team Statistics Summary", 20, y);
    doc.line(20, y + 2, 70, y + 2);
    
    // Simulação de Scout (Totalizadores)
    const scout = { kills: 0, blocks: 0, aces: 0 };
    match.actionLog?.forEach((l: any) => {
        if (l.skill === 'attack') scout.kills++;
        if (l.skill === 'block') scout.blocks++;
        if (l.skill === 'ace') scout.aces++;
    });

    y += 15;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Attack Points (Kills): ${scout.kills}`, 30, y);
    doc.text(`Total Kill Blocks: ${scout.blocks}`, 30, y + 8);
    doc.text(`Total Service Aces: ${scout.aces}`, 30, y + 16);

    // -- FOOTER --
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Confidence in results is based on active scout recording. This is a VolleyScore Pro V2 official export.", 105, 280, { align: "center" });
    doc.text("Learn more at volleyscore.pro", 105, 285, { align: "center" });

    // -- EXPORTAÇÃO --
    const pdfBase64 = doc.output('datauristring');
    const filename = `VolleyScore_Match_${match.id.substring(0,6)}_${new Date().getTime()}.pdf`;

    if (Capacitor.isNativePlatform()) {
        const base64 = pdfBase64.split(',')[1];
        try {
            const savedFile = await Filesystem.writeFile({
                path: filename,
                data: base64,
                directory: Directory.Documents,
                encoding: Encoding.UTF8
            });
            await Share.share({ title: "Match Report", url: savedFile.uri });
        } catch (e) {
            console.error("PDF Native Export Error", e);
        }
    } else {
        doc.save(filename);
    }
  }
}
