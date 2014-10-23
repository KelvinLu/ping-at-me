from django.conf.urls import patterns, include, url

from pingapp import views

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'ping_at_me.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^$', views.Homepage.as_view(), name = 'homepage'),
    url(r'^register$', views.Register.as_view(), name = 'register'),
    url(r'^authenticate$', views.Authenticate.as_view(), name = 'authenticate'),
    url(r'^logout$', views.Logout.as_view(), name = 'logout'),
    url(r'^pingpanel$', views.Pingpanel.as_view(), name = 'pingpanel'),
)
