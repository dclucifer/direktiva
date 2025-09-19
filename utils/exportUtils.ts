import { Script, ScriptPart } from "../types";

const downloadFile = (filename: string, content: string, mimeType: string) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: mimeType });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);
};

export const exportScriptAsJSON = (script: Script) => {
    const jsonString = JSON.stringify(script, null, 2);
    downloadFile(`${script.title.replace(/\s+/g, '_')}.json`, jsonString, 'application/json');
};

const toSrtTimeFormat = (seconds: number): string => {
    const date = new Date(0);
    date.setSeconds(seconds);
    const timeString = date.toISOString().substr(11, 12);
    return timeString.replace('.', ',');
};

export const exportScriptAsSRT = (script: Script) => {
    let srtContent = '';
    let counter = 1;
    let currentTime = 0;
    const sceneDuration = 4; // Assume each dialogue part takes ~4 seconds

    const addPartToSrt = (part: ScriptPart) => {
        if(part.dialogue) {
            const startTime = toSrtTimeFormat(currentTime);
            currentTime += sceneDuration;
            const endTime = toSrtTimeFormat(currentTime);
            srtContent += `${counter}\n${startTime} --> ${endTime}\n${part.dialogue}\n\n`;
            counter++;
        }
    };
    
    addPartToSrt(script.hook);
    script.content.forEach(addPartToSrt);
    addPartToSrt(script.cta);

    downloadFile(`${script.title.replace(/\s+/g, '_')}.srt`, srtContent, 'application/x-subrip');
};


export const exportScriptAsCSV = (script: Script) => {
    const headers = ['Part', 'Scene', 'Visual', 'Dialogue', 'Sound Effect'];
    
    const rows: string[][] = [];

    const addPartToCsv = (partName: string, part: ScriptPart, sceneNum?: number) => {
        // fix: Property 'visual' does not exist on type 'ScriptPart'. Join visual_ideas descriptions instead.
        const visualDescriptions = (part.visual_ideas || []).map(idea => idea.description).join('; ');
        rows.push([
            partName,
            sceneNum?.toString() || '',
            `"${visualDescriptions.replace(/"/g, '""')}"`,
            `"${part.dialogue.replace(/"/g, '""')}"`,
            `"${part.sound_effect.replace(/"/g, '""')}"`,
        ]);
    };

    addPartToCsv('Hook', script.hook, 1);
    script.content.forEach((p, i) => addPartToCsv('Content', p, p.scene || (i + 2)));
    addPartToCsv('CTA', script.cta, script.content.length + 2);
    
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    downloadFile(`${script.title.replace(/\s+/g, '_')}.csv`, csvContent, 'text/csv');
};