/// Marlon Dias, 2019.

class Greeting {
	// Greeting is the first line of text of the main message, it has 2 versions: 
	// -generic -> for when you don't know the recipient's name
	// -personal -> for when you want to specify a name

	constructor(title, genericText, personalText) {
		this.title = (typeof title != 'string' || title.length < 1) ? '(título)' : title;
		this.genericText = (typeof genericText != 'string' || genericText.length < 1) ? '(saudação1)' : genericText;
		this.personalText = (typeof personalText != 'string' || personalText.length < 1) ? '(saudação2)' : personalText;
	}

	getTitle() {
		return this.title;
	}

	getGenericContent() {
		return this.genericText;
	}

	getPersonalContent(name) {
		if (typeof name != 'string' || name.length < 1) return this.personalText;
		const regex = /@/;
		return this.personalText.replace(regex, name);
	}
}


class ModelText {
	// ModelText is a generic text used as a starting point for a more elaborated 
	// message about some recurrent situation.

	constructor(title, content) {
		this.title = (typeof title != 'string' || title.length < 1) ? '(título)' : title;
		this.content = (typeof content != 'string') ? '' : content;
	}

	getTitle() {
		return this.title;
	}

	getContent(){
		return this.content;
	}

	setContent(text) {
		if (typeof text == 'string') this.content = text;
	}
}


const greetings = new Map();
const modelTexts = new Map();


function clearActiveFromDropdownMenu(targetElem) {
	let elements = targetElem.getElementsByClassName('dropdown-item');
	for (el of elements) {
		if (el.className != 'dropdown-item') el.className = 'dropdown-item';
	}
}

function populateGreetingsDropdownMenu() {
	// Creates a dropdown option for each greeting, plus a divider and a 'customize' option.
	// Each button receives an event listener that performs the necessary behavior.

	const parentDiv = document.getElementById('greetingDropDownMenu');
	const greetingInput = document.getElementById('greetingTextInput');
	const greetingDescription = document.getElementById('grtInputDescription');
	greetingInput.setAttribute('placeholder', '(selecione)');
	greetingInput.setAttribute('disabled', 'true');
	greetingInput.value = '';

	function createGrtButton(id, grt) {
		let newButton = document.createElement('button');
		newButton.type = 'button';
		newButton.className = 'dropdown-item';
		newButton.innerText = grt.getTitle();
		newButton.addEventListener('click', () => {
			clearActiveFromDropdownMenu(parentDiv);
			newButton.className += ' active';
			greetingInput.setAttribute('data-mapid', id);
			if (id == 'customGrt') {
				greetingDescription.innerText = 'Saudação inicial personalizada'
				greetingInput.value = '';
				greetingInput.setAttribute('placeholder', 'Digite sua saudação');
				greetingInput.removeAttribute('disabled');
				greetingInput.focus();
			}
			else {
				greetingDescription.innerText = 'Prévia da saudação inicial';
				greetingInput.value = grt.getPersonalContent('Awelkson');
				greetingInput.setAttribute('disabled', 'true');
			}
		});
		parentDiv.appendChild(newButton);
	}

	for (gr of greetings) {
		createGrtButton(gr[0], gr[1]);
	}

	let newDivider = document.createElement('div');
	newDivider.className = 'dropdown-divider';
	parentDiv.appendChild(newDivider);

	createGrtButton('customGrt', new Greeting('Personalizar...', 'Digite sua saudação', 'Digite sua saudação'));
}

function populateModelTextsDropdownMenu() {
	// Creates a dropdown option for each model text, plus a divider and 3 special options.
	// Each button receives an event listener that performs the necessary behavior.

	const parentDiv = document.getElementById('modeltextDropDownMenu');
	const contentTextarea = document.getElementById('mainContentTextarea');

	function createModelTextButton(id, mdtxt) {
		let newButton = document.createElement('button');
		newButton.type = 'button';
		newButton.className = 'dropdown-item';
		newButton.innerText = mdtxt.getTitle();
		newButton.addEventListener('click', () => {
			let mtMapId = contentTextarea.getAttribute('data-mapid');
			if (mtMapId == 'memo1' || mtMapId == 'memo2') {
				modelTexts.get(mtMapId).setContent(contentTextarea.value);
			}
			contentTextarea.setAttribute('data-mapid', id);
			contentTextarea.value = mdtxt.getContent();
			clearActiveFromDropdownMenu(parentDiv);
			newButton.className += ' active';
		});
		parentDiv.appendChild(newButton);
	}

	createModelTextButton('empty', new ModelText('Sem texto', ''));
	createModelTextButton('memo1', modelTexts.get('memo1'));
	createModelTextButton('memo2', modelTexts.get('memo2'));

	let newDivider = document.createElement('div');
	newDivider.className = 'dropdown-divider';
	parentDiv.appendChild(newDivider);

	for (mt of modelTexts) {
		if (mt[0] == 'memo1' || mt[0] == 'memo2') continue;
		createModelTextButton(mt[0], mt[1]);
	}
}

function setupVariableAddButtons() {
	const contentTextarea = document.getElementById('mainContentTextarea');
	const buttons = document.getElementsByClassName('variable-add-button');
	for (btn of buttons) {
		let token = btn.getAttribute('data-vtoken');
		btn.addEventListener('click', () => {
			contentTextarea.value += token;
		});
	}
}

function setupUpdateBehavior() {
	// Get references to all relevant HTML elements, extract texts, update variables, 
	// mix it all up and show the result.

	const usuarioVarInput = document.getElementById('usuarioVarInput');
	const gestorVarInput = document.getElementById('gestorVarInput');
	const v1VarInput = document.getElementById('v1VarInput');
	const v2VarInput = document.getElementById('v2VarInput');
	const greetingInput = document.getElementById('greetingTextInput');
	const contentTextarea = document.getElementById('mainContentTextarea');
	const endingTextarea = document.getElementById('endingTextarea');
	const finalMessageTextarea = document.getElementById('finalMessageTextarea');
	const vars = { usuario : '', gestor : '', var1 : '', var2 : ''};
	const regexUsuario = /{{usuario}}/gi;
	const regexGestor = /{{gestor}}/gi;
	const regexVar1 = /{{var1}}/gi;
	const regexVar2 = /{{var2}}/gi;

	function updateVars() {
		// Copy whatever is in the variable fields, trimming spaces.
		vars.usuario = usuarioVarInput.value.trim();
		vars.gestor = gestorVarInput.value.trim();
		vars.var1 = v1VarInput.value.trim();
		vars.var2 = v2VarInput.value.trim();
	}

	function getMsgGreeting() {
		// Copy the current greeting, replacing user name when available.
		const grtMapId = greetingInput.getAttribute('data-mapid');
		if (grtMapId == 'customGrt') return greetingInput.value.trim();
		else {
			const gr = greetings.get(grtMapId);
			if (gr == undefined) return '(Erro: sem saudação)';
			if (vars.usuario != '') return gr.getPersonalContent(vars.usuario);
			return gr.getGenericContent();
		}
	}

	function getMsgContent() {
		// Copy any text in contentTextarea, look for valid variable tokens and replace.
		let text = contentTextarea.value.trim();
		if (text == '') return '(Erro: sem conteúdo)';
		if (vars.usuario != '') text = text.replace(regexUsuario, vars.usuario);
		if (vars.gestor != '') text = text.replace(regexGestor, vars.gestor);
		if (vars.var1 != '') text = text.replace(regexVar1, vars.var1);
		if (vars.var2 != '') text = text.replace(regexVar2, vars.var2);
		return text;
	}

	function getMsgEnding() {
		// Copy any text in endingTextarea, trimming only from the end.
		let text = endingTextarea.value.trimEnd();
		if (text == '') return '(Erro: sem encerramento)';
		return text;
	}

	function copyToClipboard(text) {
		const el = document.createElement('textarea');
		el.value = text;
		document.body.appendChild(el);
		el.select();
		document.execCommand('copy');
		document.body.removeChild(el);
	}

	document.getElementById('updateFinalTextButton').addEventListener('click', () => {
		updateVars();
		finalMessageTextarea.value = getMsgGreeting() + '\n' + getMsgContent() + '\n' + getMsgEnding(); 
	});

	document.getElementById('copyFinalTextButton').addEventListener('click', () => {
		// Copy content from finalMessageTextarea to clipboard.
		copyToClipboard(finalMessageTextarea.value);
	});
}


window.onload = () => {
	greetings.set('bdia', new Greeting('Bom dia', 'Bom dia.', 'Bom dia, @.'));
	greetings.set('btarde', new Greeting('Boa tarde', 'Boa tarde.', 'Boa tarde, @.'));
	greetings.set('bnoite', new Greeting('Boa noite', 'Boa noite.', 'Boa noite, @.'));
	greetings.set('caro', new Greeting('Caro(a)', 'Caro(a),', 'Caro(a) @,'));
	greetings.set('prez', new Greeting('Prezado(a)', 'Prezado(a),', 'Prezado(a) @,'));
	greetings.set('estim', new Greeting('Estimado(a)', 'Estimado(a),', 'Estimado(a) @,'));
	
	modelTexts.set('memo1', new ModelText('Memória 1', ''));
	modelTexts.set('memo2', new ModelText('Memória 2', ''));
	modelTexts.set('aprovacao1', new ModelText('Aprovação do gestor X', 'Para prosseguirmos com o atendimento, é necessária a aprovação do(a) gestor(a) {{gestor}}.'));
	modelTexts.set('aprovacao2', new ModelText('Aprovação do gestor (sem nome)', 'Para prosseguirmos com o atendimento, é necessária a aprovação do gestor de seu setor. \nPoderia nos informar o nome completo, ou nome de usuário, de seu supervisor?'));
	modelTexts.set('termo-email', new ModelText('Termo de compromisso para e-mail', 'Para prosseguirmos com o atendimento, é necessário o envio do Termo de Compromisso do Usuário, devidamente preenchido e assinado pelo colaborador e pelos supervisores.'));
	modelTexts.set('user-espelho', new ModelText('Falta usuário espelho', 'Poderia nos informar o nome de usuário (nome.sobrenome) de alguém que já tenha acesso ao recurso citado para que possamos espelhar as permissões?'));
	modelTexts.set('erro-pers', new ModelText('Erro persiste / mais detalhes', 'Poderia verificar se o problema ainda ocorre? Se sim, poderia informar mais detalhes, ou enviar prints, para que possamos entender a situação?'));
	modelTexts.set('dupli-sr', new ModelText('Duplicidade com SR', 'Constatamos que esta solicitação está em duplicidade com a SR{{var1}}, portanto, a mesma será encerrada. \nFavor acompanhar o progresso da solicitação original.'));
	modelTexts.set('dupli-ir', new ModelText('Duplicidade com IR', 'Constatamos que este incidente está em duplicidade com o IR{{var1}}, portanto, a mesma será encerrada. \nFavor acompanhar o progresso do incidente original.'));
	modelTexts.set('duvida-fake', new ModelText('Não é dúvida, mas pedido específico', 'Este tipo de chamado não é uma dúvida, mas sim um pedido específico. Como os procedimentos são diferentes, não poderemos prosseguir com o atendimento. \nPeço que abra um novo chamado na categoria "{{var1}}".'));
	modelTexts.set('cat-incomp', new ModelText('Categoria incompatível com o que pede', 'Este chamado foi aberto em uma categoria que não corresponde ao que está sendo solicitado. Como os procedimentos são diferentes, não poderemos prosseguir com o atendimento. \nPeço que abra um novo chamado, com as mesmas informações, na categoria "{{var1}}".'));
	modelTexts.set('tentativas1', new ModelText('Esgotou 3 tentativas (aprov)', 'Após 3 tentativas de retomada do atendimento, o pedido não recebeu as aprovações necessárias. Portanto, este chamado será encerrado. \nCaso o problema persista, favor abrir novo chamado.'));
	modelTexts.set('tentativas2', new ModelText('Esgotou 3 tentativas (termo)', 'Após 3 tentativas de retomada do atendimento, não recebemos a documentação necessária. Portanto, este chamado será encerrado. \nCaso o problema persista, favor abrir novo chamado.'));
	modelTexts.set('tentativas3', new ModelText('Esgotou 3 tentativas', 'Após 3 tentativas de retomada do atendimento, este chamado será encerrado. \nCaso o problema persista, favor abrir novo chamado.'));
	modelTexts.set('polo-parc', new ModelText('Polo parceiro', 'Como se trata de um polo parceiro, sua solicitação não poderá ser atendida por esta plataforma. \nFavor abrir chamado, com as mesmas informações, via Sydle Seed.'));
	modelTexts.set('ir-avancou', new ModelText('IR avançou', 'Obrigado pelas informações. O incidente foi encaminhado ao setor responsável e em breve será tratado.'));
	modelTexts.set('install-ok', new ModelText('Instalação concluída', 'Conforme solicitado, o programa {{var1}} foi instalado e configurado na máquina {{var2}}. \nEste chamado será finalizado.'));
	modelTexts.set('senha-reset', new ModelText('Senha redefinida', 'Conforme solicitado, a senha foi redefinida para "{{var1}}" e deverá ser alterada no primeiro acesso. \nEste chamado será finalizado.'));
	modelTexts.set('novo-email1', new ModelText('E-mail criado', 'Conforme solicitado, foram criados o usuário "{{var1}}" e a caixa de e-mails "{{var1}}@unicesumar.edu.br", ambos com a senha inicial "{{var2}}". Favor repassar essas informações ao colaborador. \nEste chamado será finalizado.'));
	modelTexts.set('novo-email2', new ModelText('E-mail criado 2', 'Conforme solicitado, seguem os dados de acesso ao novo e-mail institucional.\nUsuário: "{{var1}}"\nE-mail:  "{{var1}}@unicesumar.edu.br"\nSenha:   "{{var2}}" (mudar)\nFavor repassar essas informações ao colaborador.'));
	modelTexts.set('debug', new ModelText('[Debugar variáveis]', 'Informo que o colaborador {{usuario}} obteve a permissão de {{gestor}} para excluir o grupo de e-mails "{{var1}}" no dia {{var2}}. \nFavor conversar com {{gestor}} para mais detalhes.'));

	populateGreetingsDropdownMenu();
	populateModelTextsDropdownMenu();
	setupVariableAddButtons();
	setupUpdateBehavior();

	console.log('App is ready!');
};
