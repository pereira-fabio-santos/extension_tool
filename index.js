const vscode = require('vscode')
const fs = require('fs')

let response = ''

const extensionTypes = [
  {
    label: 'Comando',
    description: 'Comando listado usando CTRL + SHIFT + P',
    extensionType: 'command'
  },
  {
    label: 'Snippet',
    description: 'Snippet para linguagem de programação',
    extensionType: 'snippet'
  }
]

let extensionProperties = {
  name: '',
  description: '',
  version: '1.0.0',
  readme: 'README.md',
  publisher: '',
  author: {
    name: 'Seu nome'
  },
  engines: {
    vscode: '^1.22.0'
  }
}

let extensionCategories = [
  "Azure",
  "Data Science",
  "Debuggers",
  "Education",
  "Extension Packs",
  "Formatters",
  "Keymaps",
  "Language Packs",
  "Linters",
  "Machine Learning",
  "Notebooks",
  "Other",
  "Programming Languages",
  "SCM Providers",
  "Snippets",
  "Testing",
  "Themes",
  "Visualization"
]

let snippetLanguages = [
  {
    label: 'C',
    option: 'c',
    example: 'printf("%s", ${1:nome_variavel_string});$0'
  },
  {
    label: 'C++',
    option: 'cpp',
    example: 'cout << ${1:nome_variavel_ou_valor};$0'
  },
  {
    label: 'C#',
    option: 'csharp',
    example: 'Console.WriteLine(${1:Texto});$0 // Exibe o texto \'${1:Texto}\''
  },
  {
    label: 'HTML',
    option: 'html',
    example: '<${1:nome_tag} ${2:style=\"\">$0</${1:nome_tag}>'
  },
  {
    label: 'Java',
    option: 'java',
    example: 'System.out.println("${1:Texto}");$0'
  },
  {
    label: 'JavaScript',
    option: 'javascript',
    example: 'console.log(${1:Texto})$0'
  },
  {
    label: 'Markdown',
    option: 'markdown',
    example: '*${1:Texto em itálico}*$0'
  },
  {
    label: 'PHP',
    option: 'php',
    example: '<?php echo \'${1:Texto}\'; ?>$0'
  },
  {
    label: 'Plain Text',
    option: 'plaintext',
    example: '${1:Texto}. $0'
  },
  {
    label: 'TypeScript',
    option: 'typescript',
    example: 'let texto: string = \'${1:Texto padrão}\';$0'
  },
  {
    label: 'XML',
    option: 'xml',
    example: '<${1:nome_tag_xml}>$0</${1:nome_tag_xml}>'
  }
]

const updateExtensionProperties = (newValues) => {
  extensionProperties = {
    ...extensionProperties,
    ...newValues
  }
}

const activate = async (context) => {

  let newExtensionCommand = vscode.commands.registerCommand('extensionTool.newExtension', async () => {

    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: 'Extension Tool'
    }, async (progress, token) => {

      progress.report({ increment: 0, message: 'Escolha o tipo da extensão' })

      // Tipo da extensão
      let selectedExtensionType = await vscode.window.showQuickPick(extensionTypes, {
        canPickMany: false,
        ignoreFocusOut: true,
        placeHolder: 'Escolha uma opção',
        title: 'Tipo da extensão',
        matchOnDetail: true
      })

      if (!selectedExtensionType) {
        vscode.window.showErrorMessage('Não foi selecionado um tipo de extensão')
        return
      }

      progress.report({ increment: 10, message: '' })

      await vscode.window.showInformationMessage('Selecione uma pasta para guardar a extensão', 'Selecionar pasta')

      // Pasta para guardar a extensão
      let extensionLocation = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: 'Selecionar',
        title: 'Selecione uma pasta para guardar a extensão'
      })

      if (!extensionLocation) {
        vscode.window.showErrorMessage('É necessário informar uma pasta para guardar a extensão')
        return
      }

      let folderPath =
      process.platform === 'linux'
        ? extensionLocation[0].path
        : extensionLocation[0].path.substring(1, undefined)

      progress.report({ increment: 10, message: 'Informe um nome para a extensão' })

      do {
        // Nome da extensão
        response = await vscode.window.showInputBox({
          ignoreFocusOut: true,
          title: 'Nome da extensão (Required)',
          placeHolder: 'Informe um nome para a extensão'
        })

        if (!response) {
          vscode.window.showErrorMessage('O nome para a extensão é obrigatório')
          response = ''
        }

      } while (response.length === 0)

      updateExtensionProperties({
        name: response.replaceAll(' ', '_').replaceAll('#', '').replaceAll('ã', 'a').replaceAll('-', '').toLowerCase()
      })

      progress.report({ increment: 10, message: 'Informe o nome de exibição da extensão' })

      // Nome de exibição
      response = await vscode.window.showInputBox({
        ignoreFocusOut: true,
        title: 'Nome de exibição (Optional)',
        placeHolder: 'Informe o nome da extensão para exibição'
      })

      if (!response) {
        updateExtensionProperties({ displayName: extensionProperties.name })
      } else {
        updateExtensionProperties({ displayName: response })
      }

      progress.report({ increment: 10, message: 'Informe uma descrição para a extensão' })

      // Descrição da extensão
      response = await vscode.window.showInputBox({
        ignoreFocusOut: true,
        title: 'Descrição da extensão (Optional)',
        placeHolder: 'Informe uma descrição para a extensão'
      })

      if (response) {
        updateExtensionProperties({ description: response })
      }

      progress.report({ increment: 10, message: 'Informe seu nome (Optional)' })

      // Nome do proprietário da extensão (opcional)
      response = await vscode.window.showInputBox({
        ignoreFocusOut: true,
        title: 'Seu nome (Optional)',
        placeHolder: 'Informe seu nome'
      })

      if (response) {
        updateExtensionProperties({ author: { name: response } })
      }

      progress.report({ increment: 10, message: 'Adicione keywords (Optional)' })

      // Adicionando Keywords
      let keywordsArray = []
      let newKeyword = true

      do {

        response = await vscode.window.showInputBox({
          ignoreFocusOut: true,
          title: 'Keyword (Optional)',
          placeHolder: 'Informe uma keyword. Texto vazio cancela.'
        })

        if (!response || response.trim().length === 0) {
          newKeyword = false
        } else {
          keywordsArray.push(response)
        }

      } while (newKeyword === true)

      if (keywordsArray.length > 0) updateExtensionProperties({ keywords: keywordsArray })

      // Extensão do tipo Snippet
      if (selectedExtensionType.extensionType === 'snippet') {

        // Define a categoria Snippets
        updateExtensionProperties({ categories: ["Snippets"] })

        progress.report({ increment: 20, message: 'Selecione a linguagem' })

        do {

          response = await vscode.window.showQuickPick(snippetLanguages, {
            canPickMany: false,
            ignoreFocusOut: true,
            title: 'Linguagem',
            placeHolder: 'Selecione uma linguagem'
          })

          if (!response) {
            vscode.window.showErrorMessage('É necessário selecionar uma linguagem!')
            response = false
          }

        } while (response === false)

        updateExtensionProperties({
          contributes: {
            snippets: [
              {
                language: response.option,
                path: 'snippets.json'
              }
            ]
          }
        })

        let snippetSample = {
          snippetName: {
            prefix: 'atalho_do_snippet',
            body: [
              response.example
            ],
            description: 'Descrição do Snippet'
          }
        }

        // Grava o exemplo de snippet
        fs.writeFile(
          folderPath.concat(`/snippets.json`),
          JSON.stringify(snippetSample),
          (error) => console.log(error)
        )
      } else if (selectedExtensionType.extensionType === 'command') {
        // Extensão do tipo Command

        // Categorias da extensão
        let categories = []

        response = await vscode.window.showQuickPick([
          {
            label: 'Sim',
            option: 'sim'
          },
          {
            label: 'Não',
            option: 'nao'
          }
        ], {
          canPickMany: false,
          ignoreFocusOut: true,
          title: 'Adicionar categorias?'
        })

        if (response && response.option === 'sim') {

          progress.report({ increment: 10, message: 'Selecione as categorias' })

          response = await vscode.window.showQuickPick(extensionCategories, {
            ignoreFocusOut: true,
            title: 'Categorias',
            placeHolder: 'Selecione as categorias',
            canPickMany: true
          })

          if (response && response.length > 0) {
            categories = response
          }
        }

        if (categories.length > 0) updateExtensionProperties({ categories })

        progress.report({ increment: 5, message: 'Informe um nome para o arquivo da extensão (Optional)' })

        // Nome do arquivo da extensão
        response = await vscode.window.showInputBox({
          ignoreFocusOut: true,
          title: 'Arquivo da extensão (Optional)',
          placeHolder: 'Nome para o arquivo da extensão (index.js por default)'
        })

        if (!response) response = 'index'

        updateExtensionProperties({ main: response.split('.')[0].toLowerCase().concat('.js') })

        progress.report({ increment: 5, message: 'Informe um nome e um título para o comando' })

        // Nome e titulo do comando
        let commandName = ''

        do {

          commandName = await vscode.window.showInputBox({
            ignoreFocusOut: true,
            title: 'Comando (Required)',
            placeHolder: 'Nome para o comando sem espaço (Exemplo: commandExample)'
          })

          if (!commandName) {
            vscode.window.showErrorMessage('É necessário informar o nome do comando.')
            commandName = ''
          }

        } while (commandName.length === 0)

        // formato o nome do comando corretamente
        commandName = commandName.trim().replaceAll(' ', '_')

        updateExtensionProperties({
          activationEvents: [
            `onCommand:${commandName}`
          ]
        })

        do {

          response = await vscode.window.showInputBox({
            ignoreFocusOut: true,
            title: 'Titulo do comando (Required)',
            placeHolder: 'Título para o comando (Exemplo: Command Example)'
          })

          if (!response) {
            vscode.window.showErrorMessage('O título do comando é necessário.')
            response = ''
          }

        } while (response.length === 0)

        updateExtensionProperties({
          contributes: {
            commands: [
              {
                command: commandName,
                title: response
              }
            ]
          }
        })

        progress.report({ increment: -100, message: '' })
        progress.report({ increment: 50, message: 'Gravando arquivo da extensão...' })

        // Monta as informações da extensão para gravar no arquivo de template
        let extensionFileText = ''

        extensionFileText = extensionFileText.concat('const vscode = require(\'vscode\')\n\n')

        extensionFileText = extensionFileText.concat('const activate = async (context) => {\n\n')

        extensionFileText = extensionFileText.concat(`\tlet ${extensionProperties.contributes.commands[0].command} = vscode.commands.registerCommand(\'${extensionProperties.contributes.commands[0].command}\', async () => {\n`)
        extensionFileText = extensionFileText.concat('\t\t//Código da extensão\n')
        extensionFileText = extensionFileText.concat('\t})\n\n')

        extensionFileText = extensionFileText.concat(`\tcontext.subscriptions.push(${extensionProperties.contributes.commands[0].command})\n`)

        extensionFileText = extensionFileText.concat('}\n\n')

        extensionFileText = extensionFileText.concat('const deactivate = () => { }\n\n')
        extensionFileText = extensionFileText.concat('module.exports = {\n')
        extensionFileText = extensionFileText.concat('\tactivate,\n')
        extensionFileText = extensionFileText.concat('\tdeactivate\n')
        extensionFileText = extensionFileText.concat('}')

        // grava o arquivo da extensão
        await fs.writeFile(
          folderPath.concat(`/${extensionProperties.main}`),
          extensionFileText,
          (error) => console.log('error', error)
        )
      }

      progress.report({ increment: -100, message: '' })
      progress.report({ increment: 50, message: 'Gravando arquivo com instruções sobre extensão...' })

      // Todos os tipos de extensão tem package.json, README.md e instructions.md
      let instructions = ''

      instructions = instructions.concat(`## Instruções sobre extensão\n`)
      instructions = instructions.concat(`O nome da extensão precisa estar nesse formato: [Verificar propriedade  'name'](https://code.visualstudio.com/api/references/extension-manifest#fields)\n\n`)
      instructions = instructions.concat(`Nome do Publisher: Consultar: https://code.visualstudio.com/api/working-with-extensions/publishing-extension#publishing-extensions\n\n`)

      instructions = instructions.concat(`## Debug da extensão\n`)
      instructions = instructions.concat(`Necessário instalar as dependências com o comando \`npm install\` ou \`yarn install\`\n\n`)
      instructions = instructions.concat('Para testar a extensão pressione F5 (no arquivo .js) e selecione VS Code Extension Development.\n\n')
      instructions = instructions.concat('É possível colocar breakpoints para testar a extensão.\n\n')
      instructions = instructions.concat('Se acontecer algum erro de não encontrar o comando, provavelmente há um erro no código.\n\n')

      instructions = instructions.concat(`## Criar instalador da extensão\n`)
      instructions = instructions.concat(`Verificar se o \`vsce\` já está instalado com o comando \`vsce --version\`  \nSe não estiver instalado, instale-o com o comando \`npm install --global @vscode/vsce\` ou \`yarn add @vscode/vsce\`\n\n`)
      instructions = instructions.concat(`Comando no terminal\n`)
      instructions = instructions.concat(`\`npm install && vsce package\`\n`)
      instructions = instructions.concat(`ou\n`)
      instructions = instructions.concat(`\`yarn install && vsce package\`\n\n`)

      instructions = instructions.concat(`## Instalar a extensão localmente\n`)
      instructions = instructions.concat(`\`code --install-extension arquivo_instalador.vsix\`\n\n`)

      instructions = instructions.concat(`## Publicar extensão\n`)
      instructions = instructions.concat(`Documentação para [publicar extensão](https://code.visualstudio.com/api/working-with-extensions/publishing-extension).`)

      // Grava o arquivo de instruções
      await fs.writeFile(
        folderPath.concat(`/instructions.md`),
        instructions,
        (error) => console.log('error', error)
      )

      progress.report({ increment: 25, message: 'Gravando arquivo package.json...' })

      // Grava o package.json
      await fs.writeFile(
        folderPath.concat(`/package.json`),
        JSON.stringify(extensionProperties),
        (error) => console.log('error', error)
      )

      progress.report({ increment: 25, message: 'Gravando arquivo README.md...' })

      // Escreve o arquivo README
      await fs.writeFile(
        folderPath.concat(`/README.md`),
        `# ${extensionProperties.name}`,
        (error) => console.log('error', error)
      )

      progress.report({ increment: 100, message: `A extensão ${extensionProperties.displayName} foi criada.` })

      let option = await vscode.window.showInformationMessage(`Opção disponível`, 'Copiar local da pasta')

      if (option && option === 'Copiar local da pasta') {
        await vscode.env.clipboard.writeText(extensionLocation[0].path.substring(1, undefined))
        vscode.window.showInformationMessage('O local da pasta foi copiado para a área de transferência')
      }
    })
  })

  context.subscriptions.push(newExtensionCommand)
}

const deactivate = () => {

}

module.exports = {
  activate,
  deactivate
}