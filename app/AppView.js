import Backbone from 'backbone'
import FileUploadView from './FileUploadView'
import FileDownloadView from './FileDownloadView'

const AppView = Backbone.View.extend({
    el: '.app',

    initialize: function(options){
        this.router = options.router
        this.links = new Backbone.Collection()
    },

    renderFileUpload: function(){
        var fileUploadView = new FileUploadView({collection: this.links});
        this.listenTo(fileUploadView, 'link:clicked', this.navigateToLink)
        this.$el.html(fileUploadView.$el)
        this.setCurrentView(fileUploadView)
    },

    navigateToLink: function(route){
        this.router.navigate(route, {trigger: true})
    },

    renderFileDownload: function(fileId){
        var fileDownloadView = new FileDownloadView({fileId: fileId})
        this.$el.html(fileDownloadView.$el)
        this.setCurrentView(fileDownloadView)
    },

    setCurrentView: function(view){
        if(this.currentView) {
            this.stopListening(this.currentView)
            this.currentView.remove()
        }

        this.currentView = view
    }
})

export default AppView
