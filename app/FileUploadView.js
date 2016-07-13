import $ from 'jquery'
import Backbone from 'backbone'
import _ from 'underscore'
import FileUploadTemplate from 'raw!./file-upload.tpl.html'
import ShareLinkTemplate from 'raw!./share-link.tpl.html'

const FileUploadView = Backbone.View.extend({
    template: _.template(FileUploadTemplate),
    linkTemplate: _.template(ShareLinkTemplate),

    events: {
        'submit .file-upload': 'uploadFiles'
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
        return this.linkTemplate({link: link.get('link')})
    },

    uploadFiles: function(e){
        e.preventDefault();
        //TODO: Add form validation
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
                this.collection.add(new Backbone.Model({link: response.link}))
        })
        .fail((error) => {
            //TODO: Notify the user something went wrong
            console.log(error)
        })
    }
})

export default FileUploadView
