import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from 'src/app/services/category.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
})
export class ProductFormComponent implements OnInit {
  form!: FormGroup;
  categories: any[] = [];
  isEdit = false;
  productId!: number;
  selectedImage: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(1)]],
      categoryId: ['', Validators.required],
    });

    this.loadCategories();

    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.isEdit = true;
        this.productId = +params['id'];
        this.loadProduct();
      }
    });
  }

  loadCategories() {
    this.categoryService.getAll().subscribe((res) => (this.categories = res));
  }

  loadProduct() {
    this.productService.getProduct(this.productId).subscribe((res: any) => {
      this.form.patchValue({
        name: res.name,
        price: res.price,
        categoryId: res.categoryId,
        image: res.image,
      });

      if (res.image) {
        this.previewUrl = res.image;
      }

      this.form.markAllAsTouched();
      this.form.updateValueAndValidity();
    });
  }

  onImageSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      const reader = new FileReader();
      reader.onload = (e) => (this.previewUrl = reader.result);
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.form.invalid) return;

    const formData = new FormData();
    formData.append('name', this.form.value.name);
    formData.append('price', this.form.value.price);
    formData.append('categoryId', this.form.value.categoryId);
    if (this.selectedImage) formData.append('image', this.selectedImage);

    if (this.isEdit) {
      this.productService.updateProduct(this.productId, formData).subscribe({
        next: () => {
          alert('Product updated successfully');
          this.router.navigate(['/products']);
        },
        error: (err: any) => alert(err.error.error || 'Error updating product'),
      });
    } else {
      this.productService.createProduct(formData).subscribe({
        next: () => {
          alert('Product created successfully');
          this.router.navigate(['/products']);
        },
        error: (err: any) => alert(err.error.error || 'Error creating product'),
      });
    }
  }
}
