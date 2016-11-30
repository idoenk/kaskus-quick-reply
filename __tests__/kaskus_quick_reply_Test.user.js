// ==UserScript==
// @name           Kaskus Quick Reply Testing
// @icon           https://github.com/idoenk/kaskus-quick-reply/raw/master/assets/img/kqr-logo.png
// @version        0.1
// @namespace      http://127.0.0.1/scripts/KaskusQuickReplyTesting
// @description    Basic unit test for kaskus quick reply, ui: bdd
// @include        /^https?://www.kaskus.co.id/thread/*/
// @include        /^https?://www.kaskus.co.id/lastpost/*/
// @include        /^https?://www.kaskus.co.id/post/*/
// @include        /^https?://www.kaskus.co.id/show_post/*/
// @include        /^https?://www.kaskus.co.id/group/discussion/*/
// @include        /^https?://fjb.kaskus.co.id/(thread|product|post)\b/*/
// @author         Idx
// @exclude        /^https?://www.kaskus.co.id/post_reply/*/
// @license        (CC) by-nc-sa 3.0
// @run-at         document-end
//
// ==/UserScript==
//
// v0.1 - 2010-06-29
//   Init
// --
// Creative Commons Attribution-NonCommercial-ShareAlike 3.0 License
// http://creativecommons.org/licenses/by-nc-sa/3.0/deed.ms
// 
// Package-Dependencies:
//  http://mochajs.org/
//  https://github.com/chaijs/chai
//  https://github.com/chaijs/chai-jquery
// --------------------------------------------------------
// ==/UserScript==
(function () {

// script being injected to page
function main(window, $){
  var gvar = {
      debug: 1,
      timeout_wait: 10,
      qrID: '#qr-content-wrapper',
      qrEditor: '#kqr-reply-messsage',
      getCSS: function(){
        var i = '!important',
            zi = 'z-index:999999'+i+';'
        ;
        return ''
          +'#mocha{position:fixed;'+zi+' min-width:420px; top:0; right:0; background-color: #ddd; opacity:.875; margin-right:0'+i+';}'
          +'#mocha-stats{'+zi+'top: 60px'+i+'; right: 15px'+i+'; background-color: #fff;}'
          +'#reload-mocha,#close-mocha{position:fixed; top:65px;}'
          +'#reload-mocha{right: 330px;}'
          +'#close-mocha{right: 300px;}'
        ;
      }
  };

  // Helpers
  function clog(x){
    var isText = (['string','number'].indexOf(typeof x) != -1);
    if( gvar.debug && console ){
      console.info('[qtest]: '+(isText ? x : ''));
      if( !isText )
        console.info(x);
    }
  }
  function SimulateMouse(elem,event,preventDef) {
    if("object" != typeof elem) return;
    var evObj = document.createEvent('MouseEvents');
    preventDef = ( "undefined" != typeof preventDef && preventDef ? true : false);
    evObj.initEvent(event, preventDef, true);
    try{elem.dispatchEvent(evObj);}
     catch(e){ clog('Error. elem.dispatchEvent is not function.'+e)}
  }

  // test
  function testClickQuickReply(){
    clog('[testClickQuickReply]');
    var $QR = $(gvar.qrID),
        expect = chai.expect,
        $editor = $QR.find(gvar.qrEditor),
        $postBit = $QR.closest(".ajax_qr_area").prev(),
        isMoreThanOnePost = ($(".row.nor-post").length > 1)
    ;
    
    describe('Editor', function() {

      before(function(done){
        clog('clicking last QR-button..');
        SimulateMouse($postBit.find(".button_qr").get(0), 'click', true);

        setTimeout(function(){
          done();
        }, 351);
      });

      it('qr-should-have-focus-last-postbit?', function(){

        expect($editor.closest('.ajax_qr_area').next())
          .not.to.have.attr('id');
      });
    });


    if( isMoreThanOnePost )
    describe('Editor', function(){
      before(function(done){
        clog('clicking first QR-button..');
        SimulateMouse($(".row.nor-post").first().find(".button_qr").get(0), 'click', true);

        setTimeout(function(){
          done();
        }, 571);
      }); 

      it('qr-should-have-focus-on-1st-postbit?', function(){

        var $row = $editor.closest('.ajax_qr_area').prev();
        expect($row).to.have.attr('id');

        expect($row.prev())
          .not.to.have.attr('id');
      });
    });
  }

  // test
  function testClickBIU(){
    clog('[testClickBIU]');
    var $QR = $(gvar.qrID),
        $editor = $QR.find(gvar.qrEditor),
        $wrapHead = $QR.find(".markItUpHeader"),
        $btnBold = $wrapHead.find("[data-bb=B]"),
        $btnItalic = $wrapHead.find("[data-bb=I]"),
        $btnUline = $wrapHead.find("[data-bb=U]"),
        $btnClear = $QR.find("#clear_text")
    ;
    

    var expect = chai.expect;
    describe('Clear Button', function () {
      it('editor cleared', function(){
        $editor.val('Foobar').change();
        SimulateMouse($btnClear.get(0), 'click', true);
        expect($editor).to.have.value('')
      });
    });


    describe('BIU', function () {
      it('BBCODE: [B]', function(){
        
        SimulateMouse($btnClear.get(0), 'click', true);
        SimulateMouse($btnBold.get(0), 'click', true);
        // $editor.should.have.value('[B][/B]');
        expect($editor).to.have.value('[B][/B]');

        SimulateMouse($btnClear.get(0), 'click', true);
      });

      it('BBCODE: [I]', function(){
        SimulateMouse($btnClear.get(0), 'click', true);
        SimulateMouse($btnItalic.get(0), 'click', true);

        // $editor.should.have.value('[I][/I]');
        expect($editor).to.have.value('[I][/I]');

        SimulateMouse($btnClear.get(0), 'click', true);
      });

      it('BBCODE: [U]', function(){
        SimulateMouse($btnClear.get(0), 'click', true);
        SimulateMouse($btnUline.get(0), 'click', true);

        // $editor.should.have.value('[U][/U]');
        expect($editor).to.have.value('[U][/U]');

        SimulateMouse($btnClear.get(0), 'click', true);
      });

      // ----
      it('BBCODE: [B]Foo', function(){
        
        SimulateMouse($btnClear.get(0), 'click', true);
        $editor.val('Foobar').focus().select();
        SimulateMouse($btnBold.get(0), 'click', true);

        expect($editor).to.have.value('[B]Foobar[/B]');

        SimulateMouse($btnClear.get(0), 'click', true);
      });
      it('BBCODE: [I]Foo', function(){
        SimulateMouse($btnClear.get(0), 'click', true);
        $editor.val('Foobar').focus().select();
        SimulateMouse($btnItalic.get(0), 'click', true);

        expect($editor).to.have.value('[I]Foobar[/I]');

        SimulateMouse($btnClear.get(0), 'click', true);
      });
      it('BBCODE: [U]Foo', function(){
        SimulateMouse($btnClear.get(0), 'click', true);
        $editor.val('Foobar').focus().select();
        SimulateMouse($btnUline.get(0), 'click', true);

        expect($editor).to.have.value('[U]Foobar[/U]');

        SimulateMouse($btnClear.get(0), 'click', true);
      });
    });
  }

  // test
  function testClickLCR_Custom(){
    clog('[testClickLCR_Custom]');
    var $QR = $(gvar.qrID),
        $editor = $QR.find(gvar.qrEditor),
        $wrapHead = $QR.find(".markItUpHeader"),
        $btnLeft = $wrapHead.find("[data-bb=LEFT]"),
        $btnCenter = $wrapHead.find("[data-bb=CENTER]"),
        $btnRight = $wrapHead.find("[data-bb=RIGHT]"),
        $btnIndent = $wrapHead.find("[data-bb=INDENT]"),
        $btnEmail = $wrapHead.find("[data-bb=EMAIL]"),
        $btnQuote = $wrapHead.find("[data-bb=QUOTE]"),
        $btnCode = $wrapHead.find("[data-bb=CODE]"),
        $btnHtml = $wrapHead.find("[data-bb=HTML]"),
        $btnPhp = $wrapHead.find("[data-bb=PHP]"),
        $btnLink = $wrapHead.find("[data-bb=URL]"),
        $btnImg = $wrapHead.find("[data-bb=IMG]"),
        $btnTrans = $wrapHead.find("[data-bb=TRANSPARENT]"),
        $btnNoParse = $wrapHead.find("[data-bb=NOPARSE]"),
        $btnYoutube = $wrapHead.find("[data-bb=YOUTUBE]"),
        $btnVimeo = $wrapHead.find("[data-bb=VIMEO]"),
        $btnSCloud = $wrapHead.find("[data-bb=SOUNDCLOUD]"),
        $btnDMotion = $wrapHead.find("[data-bb=DAILYMOTION]"),
        $btnSmule = $wrapHead.find("[data-bb=SMULE]"),
        $btnAddTitle = $wrapHead.find("#mnu_add_title"),
        $wrapColor = $wrapHead.find(".markItUpButton95-wrapper"),
        $btnColorRandom = null,
        $wrapFont = $wrapHead.find(".markItUpButton19-wrapper"),
        $btnFontRandom = null,
        $wrapSize = $wrapHead.find(".markItUpButton20-wrapper"),
        $btnSizeRandom = null,
        $btnSmilies = $QR.find("#btn_smiley"),
        $btnUpload = $QR.find("#btn_upload"),
        $boxBottom = $QR.find(".box-bottom"),
        $boxSmiliey = $boxBottom.find(".box-smiley"),
        $boxUploader = $boxBottom.find(".box-upload"),
        $btnClear = $QR.find("#clear_text")
    ;
    var expect = chai.expect;
    
    describe('LCR', function(){
      it('BBCODE: [LEFT]', function(){
        
        SimulateMouse($btnClear.get(0), 'click', true);
        SimulateMouse($btnLeft.get(0), 'click', true);

        expect($editor).to.have.value('[LEFT][/LEFT]');

        SimulateMouse($btnClear.get(0), 'click', true);
      });
      it('BBCODE: [CENTER]', function(){
        
        SimulateMouse($btnClear.get(0), 'click', true);
        SimulateMouse($btnCenter.get(0), 'click', true);

        expect($editor).to.have.value('[CENTER][/CENTER]');

        SimulateMouse($btnClear.get(0), 'click', true);
      });
      it('BBCODE: [RIGHT]', function(){
        
        SimulateMouse($btnClear.get(0), 'click', true);
        SimulateMouse($btnRight.get(0), 'click', true);

        expect($editor).to.have.value('[RIGHT][/RIGHT]');

        SimulateMouse($btnClear.get(0), 'click', true);
      });

      // --
      it('BBCODE: [LEFT]Foo', function(){
        
        SimulateMouse($btnClear.get(0), 'click', true);
        $editor.val('Foobar').focus().select();
        SimulateMouse($btnLeft.get(0), 'click', true);

        expect($editor).to.have.value('[LEFT]Foobar[/LEFT]');

        SimulateMouse($btnClear.get(0), 'click', true);
      });
      it('BBCODE: [CENTER]Foo', function(){
        
        SimulateMouse($btnClear.get(0), 'click', true);
        $editor.val('Foobar').focus().select();
        SimulateMouse($btnCenter.get(0), 'click', true);

        expect($editor).to.have.value('[CENTER]Foobar[/CENTER]');

        SimulateMouse($btnClear.get(0), 'click', true);
      });
      it('BBCODE: [RIGHT]Foo', function(){
        
        SimulateMouse($btnClear.get(0), 'click', true);
        $editor.val('Foobar').focus().select();
        SimulateMouse($btnRight.get(0), 'click', true);

        expect($editor).to.have.value('[RIGHT]Foobar[/RIGHT]');

        SimulateMouse($btnClear.get(0), 'click', true);
      });
    });

    describe('CUSTOM', function(){
      it('Button ADD-TITLE', function(){
        
        SimulateMouse($btnAddTitle.get(0), 'click', true);
        expect($('#kqr-title_message')).to.be.visible;

        SimulateMouse($btnAddTitle.get(0), 'click', true);
      });
      it('BBCODE: [INDENT]', function(){
        
        SimulateMouse($btnClear.get(0), 'click', true);
        SimulateMouse($btnIndent.get(0), 'click', true);

        expect($editor).to.have.value('[INDENT][/INDENT]');

        SimulateMouse($btnClear.get(0), 'click', true);
      });
      it('BBCODE: [EMAIL]', function(){
        
        SimulateMouse($btnClear.get(0), 'click', true);

        var email = 'abc@example.com';
        $editor.val(email).focus().select();
        SimulateMouse($btnEmail.get(0), 'click', true);

        expect($editor).to.have.value('[EMAIL]'+email+'[/EMAIL]');

        SimulateMouse($btnClear.get(0), 'click', true);
      });
      it('BBCODE: [QUOTE]', function(){
        
        SimulateMouse($btnClear.get(0), 'click', true);
        SimulateMouse($btnQuote.get(0), 'click', true);

        expect($editor).to.have.value('[QUOTE][/QUOTE]');

        SimulateMouse($btnClear.get(0), 'click', true);
      });
      it('BBCODE: [CODE]', function(){
        
        SimulateMouse($btnClear.get(0), 'click', true);
        SimulateMouse($btnCode.get(0), 'click', true);

        expect($editor).to.have.value('[CODE][/CODE]');

        SimulateMouse($btnClear.get(0), 'click', true);
      });
      it('BBCODE: [HTML]', function(){
        
        SimulateMouse($btnClear.get(0), 'click', true);
        SimulateMouse($btnHtml.get(0), 'click', true);

        expect($editor).to.have.value('[HTML][/HTML]');

        SimulateMouse($btnClear.get(0), 'click', true);
      });
      it('BBCODE: [PHP]', function(){
        
        SimulateMouse($btnClear.get(0), 'click', true);
        SimulateMouse($btnPhp.get(0), 'click', true);

        expect($editor).to.have.value('[PHP][/PHP]');

        SimulateMouse($btnClear.get(0), 'click', true);
      });

      // --
      it('BBCODE: [INDENT]Foo', function(){
        
        SimulateMouse($btnClear.get(0), 'click', true);
        $editor.val('Foobar').focus().select();
        SimulateMouse($btnIndent.get(0), 'click', true);

        expect($editor).to.have.value('[INDENT]Foobar[/INDENT]');

        SimulateMouse($btnClear.get(0), 'click', true);
      });
      it('BBCODE: [EMAIL]Foo', function(){
        
        SimulateMouse($btnClear.get(0), 'click', true);
        $editor.val('Foobar').focus().select();
        SimulateMouse($btnEmail.get(0), 'click', true);

        expect($editor).to.have.value('[EMAIL]Foobar[/EMAIL]');

        SimulateMouse($btnClear.get(0), 'click', true);
      });
      it('BBCODE: [QUOTE]Foo', function(){
        
        SimulateMouse($btnClear.get(0), 'click', true);
        $editor.val('Foobar').focus().select();
        SimulateMouse($btnQuote.get(0), 'click', true);

        expect($editor).to.have.value('[QUOTE]Foobar[/QUOTE]');

        SimulateMouse($btnClear.get(0), 'click', true);
      });
      it('BBCODE: [CODE]Foo', function(){
        
        SimulateMouse($btnClear.get(0), 'click', true);
        $editor.val('Foobar').focus().select();
        SimulateMouse($btnCode.get(0), 'click', true);

        expect($editor).to.have.value('[CODE]Foobar[/CODE]');

        SimulateMouse($btnClear.get(0), 'click', true);
      });
      it('BBCODE: [HTML]Foo', function(){
        
        SimulateMouse($btnClear.get(0), 'click', true);
        $editor.val('Foobar').focus().select();
        SimulateMouse($btnHtml.get(0), 'click', true);

        expect($editor).to.have.value('[HTML]Foobar[/HTML]');

        SimulateMouse($btnClear.get(0), 'click', true);
      });
      it('BBCODE: [PHP]Foo', function(){
        
        SimulateMouse($btnClear.get(0), 'click', true);
        $editor.val('Foobar').focus().select();
        SimulateMouse($btnPhp.get(0), 'click', true);

        expect($editor).to.have.value('[PHP]Foobar[/PHP]');

        SimulateMouse($btnClear.get(0), 'click', true);
      });
      it('BBCODE: [URL]Foo', function(){
        
        var urlLink = 'http://www.google.com';
        SimulateMouse($btnClear.get(0), 'click', true);
        $editor.val(urlLink).focus().select();
        SimulateMouse($btnLink.get(0), 'click', true);

        expect($editor).to.have.value('[URL='+urlLink+']'+urlLink+'[/URL]');

        SimulateMouse($btnClear.get(0), 'click', true);
      });
      it('BBCODE: [IMG]Foo', function(){
        
        var urlLink = 'http://www.google.com/image.png';
        SimulateMouse($btnClear.get(0), 'click', true);
        $editor.val(urlLink).focus().select();
        SimulateMouse($btnImg.get(0), 'click', true);

        expect($editor).to.have.value('[IMG]'+urlLink+'[/IMG]');

        SimulateMouse($btnClear.get(0), 'click', true);
      });
      it('BBCODE: [COLOR=TRANSPARENT]Foo', function(){
        
        SimulateMouse($btnClear.get(0), 'click', true);
        $editor.val('Foobar').focus().select();
        SimulateMouse($btnTrans.get(0), 'click', true);

        expect($editor).to.have.value('[COLOR=TRANSPARENT]Foobar[/COLOR]');

        SimulateMouse($btnClear.get(0), 'click', true);
      });
      it('BBCODE: [NOPARSE]Foo', function(){
        
        SimulateMouse($btnClear.get(0), 'click', true);
        $editor.val('Foobar').focus().select();
        SimulateMouse($btnNoParse.get(0), 'click', true);

        expect($editor).to.have.value('[NOPARSE]Foobar[/NOPARSE]');

        SimulateMouse($btnClear.get(0), 'click', true);
      });
      it('BBCODE: [YOUTUBE]Foo', function(){
        
        SimulateMouse($btnClear.get(0), 'click', true);
        $editor.val('Foobar').focus().select();
        SimulateMouse($btnYoutube.get(0), 'click', true);

        expect($editor).to.have.value('[YOUTUBE]Foobar[/YOUTUBE]');

        SimulateMouse($btnClear.get(0), 'click', true);
      });
      it('BBCODE: [VIMEO]Foo', function(){
        
        SimulateMouse($btnClear.get(0), 'click', true);
        $editor.val('Foobar').focus().select();
        SimulateMouse($btnVimeo.get(0), 'click', true);

        expect($editor).to.have.value('[VIMEO]Foobar[/VIMEO]');

        SimulateMouse($btnClear.get(0), 'click', true);
      });
      it('BBCODE: [SOUNDCLOUD]Foo', function(){
        
        SimulateMouse($btnClear.get(0), 'click', true);
        $editor.val('Foobar').focus().select();
        SimulateMouse($btnSCloud.get(0), 'click', true);

        expect($editor).to.have.value('[SOUNDCLOUD]Foobar[/SOUNDCLOUD]');

        SimulateMouse($btnClear.get(0), 'click', true);
      });
      it('BBCODE: [DAILYMOTION]Foo', function(){
        
        SimulateMouse($btnClear.get(0), 'click', true);
        $editor.val('Foobar').focus().select();
        SimulateMouse($btnDMotion.get(0), 'click', true);

        expect($editor).to.have.value('[DAILYMOTION]Foobar[/DAILYMOTION]');

        SimulateMouse($btnClear.get(0), 'click', true);
      });
      it('BBCODE: [SMULE]Foo', function(){
        
        SimulateMouse($btnClear.get(0), 'click', true);
        $editor.val('Foobar').focus().select();
        SimulateMouse($btnSmule.get(0), 'click', true);

        expect($editor).to.have.value('[SMULE]Foobar[/SMULE]');

        SimulateMouse($btnClear.get(0), 'click', true);
      });
    });

    $btnColorRandom = $wrapColor.find(">li:eq("+Math.floor(Math.random() * $wrapColor.find(">li").length)+") > a");
    $btnFontRandom = $wrapFont.find(">li:eq("+Math.floor(Math.random() * $wrapFont.find(">li").length)+") > a");
    $btnSizeRandom = $wrapSize.find(">li:eq("+Math.floor(Math.random() * $wrapSize.find(">li").length)+") > a");
    describe('CUSTOM-DROPDOWNMENU', function () {
      it('BBCODE: [COLOR='+$btnColorRandom.attr('title')+']', function(){
        
        SimulateMouse($btnClear.get(0), 'click', true);
        SimulateMouse($btnColorRandom.get(0), 'click', true);

        expect($editor).to.have.value('[COLOR='+$btnColorRandom.attr('title')+'][/COLOR]');

        SimulateMouse($btnClear.get(0), 'click', true);
      });
      it('BBCODE: [FONT='+$btnFontRandom.attr('title')+']', function(){
        
        SimulateMouse($btnClear.get(0), 'click', true);
        SimulateMouse($btnFontRandom.get(0), 'click', true);

        expect($editor).to.have.value('[FONT='+$btnFontRandom.attr('title')+'][/FONT]');

        SimulateMouse($btnClear.get(0), 'click', true);
      });
      it('BBCODE: [SIZE='+$btnSizeRandom.attr('title')+']', function(){
        
        SimulateMouse($btnClear.get(0), 'click', true);
        SimulateMouse($btnSizeRandom.get(0), 'click', true);

        expect($editor).to.have.value('[SIZE='+$btnSizeRandom.attr('title')+'][/SIZE]');

        SimulateMouse($btnClear.get(0), 'click', true);
      });
    });

    describe('SMILIES-UPLOADER', function(){
      it('Btn Smilies', function(){
        
        SimulateMouse($btnSmilies.get(0), 'click', true);
        expect($boxBottom).to.be.visible;
        expect($boxSmiliey).to.be.visible;

        SimulateMouse($btnSmilies.get(0), 'click', true);
      });
      it('Close Smilies', function(){
        
        SimulateMouse($btnSmilies.get(0), 'click', true);
        expect($boxBottom).to.be.visible;
        expect($boxSmiliey).to.be.visible;

        SimulateMouse($boxSmiliey.find(".close-tab").get(0), 'click', true);
        expect($boxBottom).to.be.hidden;
        expect($boxSmiliey).to.be.hidden;
      });
      it('Btn Uploader', function(){
        
        SimulateMouse($btnUpload.get(0), 'click', true);
        expect($boxBottom).to.be.visible;
        expect($boxUploader).to.be.visible;

        SimulateMouse($btnUpload.get(0), 'click', true);
      });
      it('Close Uploader', function(){
        
        SimulateMouse($btnUpload.get(0), 'click', true);
        expect($boxBottom).to.be.visible;
        expect($boxUploader).to.be.visible;

        SimulateMouse($boxUploader.find(".close-tab").get(0), 'click', true);
        expect($boxBottom).to.be.hidden;
        expect($boxUploader).to.be.hidden;
      });
    });
  }

  // main
  function startMain(){
    clog("Inside startMain..");


    mocha.setup({
      ui: 'bdd', // [tdd,bdd]
      ignoreLeaks: true,
      // asyncOnly: true
    });
    chai.should();

    window['err'] = function (fn, msg) {
      try {
        fn();
        throw new chai.AssertionError({ message: 'Expected an error' });
      } catch (err) {
        if ('string' === typeof msg) {
          chai.expect(err.message).to.equal(msg);
        } else {
          chai.expect(err.message).to.match(msg);
        }
      }
    };

    $('body').append('<div id="mocha"></div>');
    clog('DOM #mocha appended..');
    $("#mocha")
      .css('max-height', $(window).height() - 120)
      .css('overflow-y', 'auto')
    ;

    var css = document.createElement("style");
    css.setAttribute('type', 'text/css');
    css.textContent = gvar.getCSS();
    document.body.insertBefore(css, document.body.firstChild);
    clog('CSS custom appended..');


    
    testClickQuickReply();
    testClickBIU();
    testClickLCR_Custom();



    // Run all our test suites, give it a break
    setTimeout(function(){
      clog('ignite mocha.run()');
      mocha.run();

      var $mocha = $('#mocha');
      $mocha.append(''
        +'<button id="reload-mocha" class="btn btn-sm btn-red" title="Reload page"><i class="fa fa-power-off"></i></button>'
        +'<button id="close-mocha" class="btn btn-sm btn-red" title="Dismiss this info">&times;</button>'
      );
      $mocha.find('#close-mocha').click(function(){
        $('#mocha').remove();
      });
      $mocha.find('#reload-mocha').click(function(){
        return location.reload();
      });
    }, 1234);
  }

  // wait till KQR DOM done rendered
  function waitForQR(){
    var retry_ms = 250,
        retryLater = function(){
          if( gvar.is_timeout ){
            clog('Test failed. Waiting QR-DOM to load is taking too long, '+gvar.timeout_wait+' secs');
            return !1;
          }
          return setTimeout(function(){
            waitForQR();
          }, retry_ms);
        }
    ;
    if( !$(gvar.qrID).length ){
      clog('QR Not loaded yet, retry in '+retry_ms+'ms..');
      return retryLater();
    }
    else{
      clog("QR DOM Loaded");
      clog("chai: "+typeof chai+'; $='+typeof $+'; mocha='+typeof mocha);

      startMain();
    }
  }
  gvar.is_timeout = false;
  

  // these script smust be applied on document
  var script_toload = [
        "//bowercdn.net/c/chai-jquery-2.0.0/chai-jquery.js",
        // "//cdnjs.cloudflare.com/ajax/libs/localforage/1.4.3/localforage.min.js"
      ],
      script_loaded = [],
      script_index = 0,
      script, css
  ;
  var cb_script_loaded = function(){
    setTimeout(function(){
      gvar.is_timeout = true;
    }, gvar.timeout_wait * 1000);
    return waitForQR();
  };
  var loadScript = function(url){
    var _script = document.createElement("script");
    _script.setAttribute("src", (/^https?\:\/\//.test(url) ? '' : location.protocol) + url);
    document.body.appendChild(_script);

    _script.addEventListener('load', function() {
      console.info('<script:loaded>::'+url);
      script_index++;
      script_loaded.push( url );

      if( script_loaded.length < script_toload.length )
        loadScript( script_toload[script_index] );
      else
        cb_script_loaded();
    });
  };
  loadScript( script_toload[script_index] );
}
// eof-script: `main`

+function injectScript(callback) {
  var script_toload = [
        "//cdnjs.cloudflare.com/ajax/libs/mocha/2.5.3/mocha.min.js",
        "//cdnjs.cloudflare.com/ajax/libs/chai/3.5.0/chai.min.js",
        // "//bowercdn.net/c/chai-jquery-2.0.0/chai-jquery.js",
        // "//cdnjs.cloudflare.com/ajax/libs/localforage/1.4.3/localforage.min.js"
      ],
      script_loaded = [],
      script_index = 0,
      script, css
  ;
  var cb_script_loaded = function(){
    console.info('all script-dependency loaded..');

    var main_script = document.createElement("script");
    main_script.textContent = "(" + callback.toString() + ")(window, jQuery);";
    document.body.appendChild( main_script );
  };
  var loadScript = function(url){
    var _script = document.createElement("script");
    _script.setAttribute("src", (/^https?\:\/\//.test(url) ? '' : location.protocol) + url);
    document.body.appendChild(_script);

    _script.addEventListener('load', function() {
      console.info('<script:loaded>::'+url);
      script_index++;
      script_loaded.push( url );

      if( script_loaded.length < script_toload.length )
        loadScript( script_toload[script_index] );
      else
        cb_script_loaded();
    });
  };
  loadScript( script_toload[script_index] );


  css = document.createElement("link");
  css.setAttribute('href', location.protocol+'\/\/cdnjs.cloudflare.com\/ajax\/libs\/mocha\/2.5.3\/mocha.css');
  css.setAttribute('rel', 'stylesheet');
  document.body.insertBefore(css, document.body.firstChild);
}( main );
})();