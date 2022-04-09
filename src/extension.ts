// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { existsSync } from "fs";
import { TextDecoder, TextEncoder } from "util";
import * as vscode from "vscode";

let PREDEFINED_VARIABLES = new Map();
PREDEFINED_VARIABLES.set("DATE", new Date().toDateString());

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "templr.createFileFromTemplate",
    () => {
      if (vscode.workspace.workspaceFolders !== undefined) {
        let templatesUri: vscode.Uri;
        var uri = vscode.workspace.workspaceFolders[0].uri;
        var config = vscode.workspace.getConfiguration("templr");
        var path: string | undefined = config.get("source");
        if (path && existsSync(path)) {
          templatesUri = vscode.Uri.parse(path);
        } else {
          templatesUri = vscode.Uri.joinPath(uri, "templates");
        }
        var templates: string[] = [];
        vscode.workspace.fs.readDirectory(templatesUri).then((f) => {
          f.map((t) => t[0]).forEach((t) => templates.push(t));
          vscode.window.showQuickPick(templates).then((x) => {
            var extension = x?.split(".")[1];
            vscode.window.showInputBox().then((val) => {
              PREDEFINED_VARIABLES.set("FILE_NAME", val);
              var newUri = vscode.Uri.file(`${uri.path}/${val}.${extension}`);
              var templateUri = vscode.Uri.file(`${templatesUri.path}/${x}`);
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
                            content = content.replace(variable, v);
                          }
                        });
                  });

                  var predefined_regexp = /@@[a-zA-Z_]+@@/g;
                  var needed_predefined_variables =
                    content.match(predefined_regexp);
                  needed_predefined_variables?.forEach((variable) => {
                    var variableName = variable.replace(/@@/g, "");
                    content = content.replace(
                      variable,
                      PREDEFINED_VARIABLES.get(variableName)
                    );
                  });

                  var final = Promise.resolve();
                  promises.forEach((p) => {
                    final = final.then(() => p());
                  });
                  Promise.all([final]).then(() => {
                    var contentArray = new TextEncoder().encode(content);
                    vscode.workspace.fs
                      .writeFile(newUri, contentArray)
                      .then(() =>
                        vscode.workspace
                          .openTextDocument(newUri)
                          .then((doc) => vscode.window.showTextDocument(doc))
                      );
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
