const vscode = require('vscode');
const fs = require('fs');
const ElementTree = require('elementtree');

function activate(context) {

    let selectedFilePath = ''; // Variable to store the selected file path

    // Create a button associated with the 'brahmiqtpy.browseFile' command
    let button = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    button.text = '📂QtDesigner';
    button.tooltip = 'cliquez pour sélectionner un fichier qtdesigner';
    button.command = 'brahmiqtpy.browseFile';
    button.show();
    context.subscriptions.push(button);

    

    // ... (previous code)

let browseFileDisposable = vscode.commands.registerCommand('brahmiqtpy.browseFile', function () {
    // Show a file dialog to browse for a UI file
    vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        openLabel: 'Select a UI File',
        filters: {
            'UI Files': ['ui']
        }
    }).then(fileUri => {
        if (fileUri && fileUri.length > 0) {
            selectedFilePath = fileUri[0].fsPath; // Store the selected file path
            const selectedFileContent = fs.readFileSync(selectedFilePath, 'utf-8');

            // Check if there is an active text editor
            const activeTextEditor = vscode.window.activeTextEditor;
            if (activeTextEditor) {
                // Check if the active text editor is empty
                if (activeTextEditor.document.getText().trim() === '') {
                    // Insert the content of the selected file into the active text editor
                    activeTextEditor.edit(editBuilder => {
                        const convertResult = convert(selectedFileContent, selectedFilePath);
                        editBuilder.insert(new vscode.Position(0, 0), convertResult.code);

                        // Set the language to Python
                        vscode.languages.setTextDocumentLanguage(activeTextEditor.document, convertResult.language);
                    });

                    vscode.window.showInformationMessage('Contenu inséré dans le fichier actif.');
                } else {
                    // Create a new file and insert the content
                    const convertResult = convert(selectedFileContent, selectedFilePath);
                    vscode.workspace.openTextDocument({ content: convertResult.code, language: convertResult.language }).then(document => {
                        vscode.window.showTextDocument(document);
                        vscode.window.showInformationMessage('Nouveau fichier créé avec le contenu.');
                    });
                }
            } else {
                // No open file in the editor, create a new file and insert the content
                const convertResult = convert(selectedFileContent, selectedFilePath);
                vscode.workspace.openTextDocument({ content: convertResult.code, language: convertResult.language }).then(document => {
                    vscode.window.showTextDocument(document);
                    vscode.window.showInformationMessage('Nouveau fichier créé avec le contenu.');
                });
            }
        } else {
            vscode.window.showWarningMessage("Aucun fichier d'interface utilisateur sélectionné.");
        }
    });
});

context.subscriptions.push(browseFileDisposable);

}

function convert(fileData, selectedFilePath) {
    var btnstxt = "";
    var mytxt = "";
    const phrases = [ 
        "ربِّ زِدْنِي عِلْماً",
        "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِّن لِّسَانِي يَفْقَهُوا قَوْلِي",
        "صَلّىَ اللهُ عَلى مُحَمّدٍ وَآلِ مُحَمّد. اللَّهُمَّ إِنِّي أَسْألُكَ يَا مُذَكِرَ الخَيْرِ وَفَاعِلَهُ وَالآمِرَ بِهِ ذَكِرّنِي مَا اَنّسَانِهِ الشّيطَان",
        "للَّهُمَّ اَكْرِمْنْيْ بِنُوْرِ الْفَهْمِ وَ خَرَّجَنِيْ مِنْ ظُلُمَاتِ الْوَهْمِ وَ افْتَحْ عَلَيْنَا اَبْوَابَ عِلْمَكَ",
        "اللَّهُمَّ لاَ سَهْلاً إِلّاَ مَا جَعَلّتَهٌ سَهْلاً وَأَنّتَ تَجّعَلَ الحَزَنَ إِذَا شِئتَ سَهْلاً",
        "حَسْبِيَ اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ"
      ];        
      var randomIndex = Math.floor(Math.random() * phrases.length);
    const etree = ElementTree.parse(fileData);

    etree.findall('.//widget[@class="QPushButton"]').forEach((qpushbutton) => {
        const name = qpushbutton.attrib.name;
        btnstxt += `w.${name}.clicked.connect(${name}_click)\n`;
        mytxt += `def ${name}_click():\n    pass\n\n`;
    });
    
    const code = `#🤲${phrases[randomIndex]}🤲
from PyQt5.uic import loadUi
from PyQt5.QtWidgets import*
#from pickle import*

${mytxt}

app = QApplication([])
w = loadUi(r"${selectedFilePath}")
w.show()
${btnstxt}
app.exec_()
`;

    return {
        code,
        language: 'python'
    };
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
