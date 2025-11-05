import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from 'src/app/services/category.service';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
})
export class CategoryFormComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  categoryId!: number;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', Validators.required],
    });

    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.isEdit = true;
        this.categoryId = +params['id'];
        this.loadCategory();
      }
    });
  }

  loadCategory() {
    this.categoryService.getAll().subscribe((categories: any[]) => {
      const cat = categories.find((c) => c.id === this.categoryId);
      if (cat) this.form.patchValue({ name: cat.name });
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    if (this.isEdit) {
      this.categoryService.update(this.categoryId, this.form.value).subscribe({
        next: () => {
          alert('Category updated successfully');
          this.router.navigate(['/categories']);
        },
        error: (err) => alert(err.error.error || 'Error updating category'),
      });
    } else {
      this.categoryService.create(this.form.value).subscribe({
        next: () => {
          alert('Category created successfully');
          this.router.navigate(['/categories']);
        },
        error: (err) => alert(err.error.error || 'Error creating category'),
      });
    }
  }
}
