import uuid
from django.shortcuts import render
from django.views.generic.edit import CreateView
from .models import Drawing
from django.http import JsonResponse
from ntds.settings import CF_GET_URL
from ntds.utils import CF_ACCESS
from django.views.generic import DetailView
from django.shortcuts import get_object_or_404

def DrawingView(request):
    return render(request, 'draw/draw.html')


class DrawingCreateView(CreateView, CF_ACCESS):
    http_method_names = ['post']
    model = Drawing
    fields = ['title', 'description']

    def form_valid(self, form):
        image = self.request.FILES.get('image')
        if not image:
            return JsonResponse({'error': 'No image provided'}, status=400)


        image.name = str(uuid.uuid4())

        cf_access = CF_ACCESS()
        cf_upload, status_code = cf_access.put(image)

        if status_code != 200:
            return JsonResponse(cf_upload, status=500)

        self.object = form.save(commit=False)
        self.object.imgname = image.name
        self.object.imglink = CF_GET_URL + image.name
        self.object.save()

        return JsonResponse({'message': 'Image'}, status=200)

    def form_invalid(self, form):
        return JsonResponse({'errors': form.errors}, status=400)
    


class DrawingDetailView(DetailView):
    model = Drawing
    template_name = 'draw/draw_detail.html'  

    def get_object(self, queryset=None):
        pagelink = self.kwargs.get('pagelink')
        return get_object_or_404(Drawing, pagelink=pagelink)