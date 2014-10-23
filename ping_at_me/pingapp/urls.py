from django.conf.urls import patterns, include, url

from pingapp import views

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'ping_at_me.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^$', views.homepage.as_view(), name = 'homepage'),
)
