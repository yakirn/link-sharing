import $ from 'jquery'
import Backbone from 'backbone'
import AppView from './AppView'

$(() => {
    const AppRouter = Backbone.Router.extend({
        routes: {
            '(/)' : 'home',
            '/:id': 'donwload'
        },

        initialize: function(){
            this.appView = new AppView()
        },

        home: function(){
            this.appView.renderFileUpload()
        },

        donwload: function(){
            console.error("Not implemented");
        }
    })

    window.router = new AppRouter()
    Backbone.history.start()
});
