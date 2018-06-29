//Scrolling
let $doc = $('html, body');
$('a').click(function() {
    $doc.animate({
        scrollTop: $( $.attr(this, 'href') ).offset().top
    }, 500);
    return false;
});
//Code editor
$(document).ready(function(){$('pre').makeCode({style: 'code-style-dark', addons: [{ name: 'js', parser: javascriptCode }]});});
let javascriptCode = function(text) {return text;};
let csharpCode = function(text) {
	let comment = false;
	let lines = text.split('\n');
	text = '';
	for(let i = 0; i < lines.length; i++) {
		let line = lines[i];
		line = line.replace(/(public|private|protected|static|virtual|abstract|override|class|struct|new)\b/ig, '<span class="sharp-keywords">$1</span>')
					.replace(/\b(if|else|switch|case|break|return|namespace|using|while|bool|int|float|double|true|false|void)\b/ig, '<span class="sharp-default-types">$1</span>')
					.replace(/(\/\/(.*)$)/g, '<span class="comment">$1</span>');		 
		if (!comment){
			let result1 = line.match(/\/\*([\s\S]*?)\*\//ig);
			if(result1 != null){
				for(let r = 0; r < result1.length; r++){line = line.replace(result1[r], '<span class="comment">$&</span>');}
			}else{
				let result = line.match(/\/\*([\s\S]*?)[\s\S]*/i);
				if(result != null){
					line = line.replace(result[0], '<span class="comment">$&</span>');
					comment = true;
				}
			}
		}
		else{
			let result = line.match(/[\s\S]*\*\/|\*\//);
			if(result != null){
				line = line.replace(result[0], '<span class="comment">$&</span>');
				comment = false;
			}else{line = '<span class="comment">' + line + '</span>';}
		}
		text += line;
		if (i != lines.length - 1)
			text += '\n';
	}

	return text;
};
let htmlCode = function(text) {	return text;};

(function($) {
	$.fn.makeCode = function(options) {
		let settings = $.extend({
			style: 'code-style-light',
			selectLabel: 'Copiar',
			addons: []
		}, options);
		let defaultAddons = [
			{ name: 'csharp', parser: csharpCode },
			{ name: 'html', parser: htmlCode }
		];
		options.addons = options.addons.concat(defaultAddons);
		defaultAddons = null;
		//replace html tags
		function replaceTag(tag) {
			let tagsToReplace = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };
			return tagsToReplace[tag] || tag;
		}
		function safe_tags_replace(str){return str.replace(/[&<>]/g, replaceTag);}
		function getAddon(name)	{
			let result = null;
			options.addons.forEach(function(item, i, arr) {
				if(item.name == name)
					result = item;
			});
			return result;
		}
		$(this).each(function(){
			$this = $(this);
			let syntax = $this.prop('class').replace('syntax-', '');
			let text = $this.html();
			text = safe_tags_replace(text);
			let addon = getAddon(syntax);
			if(addon != null)
				text = addon.parser(text);
			let splitter = text.split(/\n/);
			text = '';

			for(let s = 0; s < splitter.length-1; s++) {
				if(splitter[s].length > 0) {
					text += '<div class="line">' + splitter[s].replace(/^ +/gm, '\t').replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;') + '</div>';
				} else {
					text += '<div class="line"><br></div>';
				}
			}

			$this.before('<div class="code ' + settings.style + '"><div class="copy">' + settings.selectLabel + '</div><div class="numbers"></div><div class="source">' + text + '</div><div class="clear"></div></div>');

			for(let i = 1; i < splitter.length; i++) {
				let height = $this.prev().find('.source .line').eq(i-1).height();
				$this.prev().find('.numbers').append('<div style="height: ' + height + 'px">' + i + '</div>');
			}
			$this.prev().find('.source').width($this.prev().width() - ($this.prev().find('.numbers').width() + 37));
			$this.remove();
		});
		// fixed link
		$('.code').scroll(function() {
			let top = $(this).scrollTop();
			$(this).find('.copy').css('top', top + 5);
		});
		// select a code
		$('.code .copy').on('click', function(e) {
			selectText(this.parentNode.getElementsByClassName('source')[0]);
		});
		// select a line of code
		$('.code .numbers div').on('click', function(e) {
			let line = $(this).parent().parent().find('.source .line').eq($(this).index());
			selectText(line.get(0));
		});
		$(window).resize(function() {
			// --- ?
		});
		function selectText(node){
			let e = node, s, r;
			if(window.getSelection) {
				s = window.getSelection();
				r = document.createRange();
				r.selectNodeContents(e);
				s.removeAllRanges();
				s.addRange(r);
			} else if(document.selection) {
				r = document.body.createTextRange();
				r.moveToElementText(e);
				r.select();
			}
		}
	};
}(jQuery));
