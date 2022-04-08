// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { TextDecoder, TextEncoder } from "util";
import * as vscode from "vscode";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "templater" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "templater.helloWorld",
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      vscode.window.showInformationMessage("Hello World from Templater!");
      if (vscode.workspace.workspaceFolders !== undefined) {
        var uri = vscode.workspace.workspaceFolders[0].uri;
        var templatesUri = vscode.Uri.joinPath(uri, "templates");
        var templates: string[] = [];
        vscode.workspace.fs.readDirectory(templatesUri).then((f) => {
          f.map((t) => t[0].split(".")[0]).forEach((t) => templates.push(t));
          vscode.window.showQuickPick(templates).then((x) => {
            vscode.window.showInputBox().then((val) => {
              var newUri = vscode.Uri.file(`${uri.path}/${val}.txt`);
              var templateUri = vscode.Uri.file(
                `${templatesUri.path}/${x}.txt`
              );
              vscode.workspace.fs.readFile(templateUri).then((contentArray) => {
                var content = new TextDecoder().decode(contentArray);
                var regexp = /\$\$[a-zA-Z]+\$\$/g;
                var variables = content.match(regexp);
                if (variables !== null) {
                  var promises = variables.map((variable) => {
                    return () =>
                      vscode.window
                        .showInputBox({
                          placeHolder: `Enter value for ${variable.replace(
                            /\$\$/g,
                            ""
                          )} ...`,
                        })
                        .then((v) => {
                          if (v !== undefined) {
                            content = content.replace(`${variable}`, v);
                          }
                        });
                  });
                  var final = Promise.resolve();
                  promises.forEach((p) => {
                    final = final.then(() => p());
                  });
                  Promise.all([final]).then(() => {
                    var contentArray = new TextEncoder().encode(content);
                    vscode.workspace.fs.writeFile(newUri, contentArray);
                  });
                }
              });
            });
          });
        });
      }
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
