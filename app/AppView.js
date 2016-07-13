import Backbone from 'backbone'
import FileUploadView from './FileUploadView'

const AppView = Backbone.View.extend({
    el: '.app',

    initialize: function(){
        this.links = new Backbone.Collection()
    },

    renderFileUpload: function(){
        var fileUploadView = new FileUploadView({collection: this.links});
        this.$el.html(fileUploadView.$el)
        this.setCurrentView(fileUploadView)
    },

    setCurrentView: function(view){
        if(this.currentView)
            this.currentView.remove()

        this.currentView = view
    }
})

export default AppView
