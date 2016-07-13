import $ from 'jquery'
import Backbone from 'backbone'
import _ from 'underscore'
import FileDownloadTemplate from 'raw!./file-download.tpl.html'

const FileDownloadView = Backbone.View.extend({
    template: _.template(FileDownloadTemplate),
    initialize: function(options){
        this.fileId = options.fileId
        this.render();
    },

    render: function(){
        this.$el.html(this.template({fileId: this.fileId}))
    }
})

export default FileDownloadView
