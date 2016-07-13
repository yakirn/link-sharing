import $ from 'jquery'
import Backbone from 'backbone'
import _ from 'underscore'
import FileUploadTemplate from 'raw!./file-upload.tpl.html'
import ShareLinkTemplate from 'raw!./share-link.tpl.html'

const FileUploadView = Backbone.View.extend({
    template: _.template(FileUploadTemplate),
    linkTemplate: _.template(ShareLinkTemplate),

    events: {
        'submit .file-upload': 'formSubmitHandler',
        'click .file-link a' : 'linkClickHandler'
    },

    initialize: function(){
        this.render()
        this.listenTo(this.collection, 'add', this.addOne)
    },

    render: function(){
        this.$el.html(this.template())
        this.addAll()
    },

    addAll: function(){
        const linksList = this.$('.share-links')
        this.collection.each((link) => {
            linksList.append(this.getLinkView(link))
        })
    },

    addOne: function(link){
        this.$('.share-links').append(this.getLinkView(link))
    },

    getLinkView: function(link){
        return this.linkTemplate(link.toJSON())
    },

    linkClickHandler: function(e){
        e.preventDefault()
        console.log(e)
        this.trigger('link:clicked', $(e.currentTarget).attr('href'))
    },

    formSubmitHandler: function(e){
        e.preventDefault();
        if(!this.validateForm()) return;
        this.hideExplenation()
        this.formBusy()

        var formData = new FormData(this.$('.file-upload')[0]);
        $.ajax({
            url: '/files',
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            type: 'POST'
        })
        .done((response) => {
            if(response && response.link)
                this.collection.add(new Backbone.Model({link: response.link, slug: response.slug}))
        })
        .fail((error) => {
            //TODO: Notify the user something went wrong
            console.log(error)
        })
        .always(() => {
            this.formReady()
        })
    },

    pwdRegex: /^(?=.*[A-Z])(?=.*[0-9])(?=.*[a-z])[a-zA-Z0-9!@#$%]{6,}$/,
    validateForm: function() {
        //TODO use a library for form validation
        const pwd = this.$('.file-pwd').val()
        const file = this.$('.file-input').val()
        let isValid = true
        if(pwd.length > 0 && !this.pwdRegex.test(pwd)){
            isValid = false
            this.$('.file-pwd-container')
                .append(`<span class="validation-warning">If provided, Password must contain at least 6 charachters,
                    have at least one of each: Uppercase letters, Lowercase letters and Numbers.
                    Allowed special charachters: '!', '@', '#', '$' and '%'</span>`)
        }
        if(file.length < 1) {
            isValid = false
            this.$('.file-input-container').append('<span class="validation-warning">Please attach a file</span>')

        }
        return isValid
    },

    formBusy: function(){
        this.$('.btn-submit').prop('disabled',true)
        //TODO: show a spinner
    },

    formReady: function(){
        this.$('.btn-submit').prop('disabled',false)
        //TODO: hide spinner
    },

    hideExplenation: function(){
        this.$('.validation-warning').remove()
    }
})

export default FileUploadView
