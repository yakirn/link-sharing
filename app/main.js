import $ from 'jquery'
import Backbone from 'backbone'
import AppView from './AppView'

$(() => {
    const AppRouter = Backbone.Router.extend({
        routes: {
            '(/)' : 'home',
            'files/:id': 'downloadFile'
        },

        initialize: function(){
            this.appView = new AppView({router: this})
        },

        home: function(){
            this.appView.renderFileUpload()
        },

        downloadFile: function(fileId){
            this.appView.renderFileDownload(fileId)
        }
    })

    window.router = new AppRouter()
    Backbone.history.start({pushState: true})
});
