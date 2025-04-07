from django.db import models
from .utils import generate_link

class Drawing(models.Model):
    title = models.CharField(max_length=100)
    description = models.CharField(max_length=200, null=True)
    pagelink = models.CharField(max_length=8, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    imgname = models.CharField(max_length=64)
    imglink = models.URLField()
    def add_like(self):
        likes = self.likes + 1

    def save(self, *args, **kwargs):
        if not self.pk:
            super().save(*args, **kwargs)
            self.pagelink = generate_link(self.id)
            super().save(update_fields=['pagelink'])
        else:
            super().save(*args, **kwargs)

    def __str__(self):
        return self.title
