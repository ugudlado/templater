# templr README

Templr is VS code extension to simplify creating files using templates in VS code. We can use templates for various purposes from interviews to front end development.

## Features

Currently, extension supports following features:

- Supports creating files from templates
- Supports predefined variables of DATE and FILE_NAME within templates
- Support user defined variables within templates
- User setting to set templates directory

## How to use?

### Setup

- Create a folder which can hold file templates
- Create file template and store in above folder
  - Predefined constants: DATE, FILE_NAME and can be used as @@DATE@@
  - User defined variables can be created with this convention: $$Name$$
    - For each user defined variable, user will be prompted with text box.

### Create new file

- Go to Command Pallette
- Search for "Create new file from template"
- Select template name loaded from template directory
- After all inputs, new file gets created in opened workspace.

## Suggest enhancements or Report bugs

Report any issues or enhacements here: <https://github.com/ugudlado/templr/issues>
