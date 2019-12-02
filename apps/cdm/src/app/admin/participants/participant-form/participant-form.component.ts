import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { ActivatedRoute } from '@angular/router';
// import { Participant } from '@hpc/data';
// import {  } from '@cdm/core';

@Component({
  selector: 'participant-form',
  templateUrl: './participant-form.component.html',
  styleUrls: [ './participant-form.component.scss' ]
})
export class ParticipantFormComponent implements OnInit {
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit() {
  }
}
