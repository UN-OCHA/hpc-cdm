import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Operation, Attachment, AttachmentPrototype, Entity, EntityPrototype } from './operation.models';

@Injectable({providedIn: 'root'})
export class OperationState {
  private readonly _operation = new BehaviorSubject<Operation>(null);
  private readonly _attachments = new BehaviorSubject<Attachment[]>([]);
  private readonly _attachmentPrototypes = new BehaviorSubject<AttachmentPrototype[]>([]);
  private readonly _entities = new BehaviorSubject<Entity[]>([]);
  private readonly _entityPrototypes = new BehaviorSubject<EntityPrototype[]>([]);
  readonly operation$ = this._operation.asObservable();
  readonly attachments$ = this._attachments.asObservable();
  readonly attachmentPrototypes$ = this._attachmentPrototypes.asObservable();
  readonly entities$ = this._entities.asObservable();
  readonly entityPrototypes$ = this._entityPrototypes.asObservable();

  get operation(): Operation { return this._operation.getValue(); }
  set operation(val: Operation) { this._operation.next(val); }

  get attachments(): Attachment[] { return this._attachments.getValue(); }
  set attachments(val: Attachment[]) { this._attachments.next(val); }

  get entities(): Entity[] { return this._entities.getValue(); }
  set entities(val: Entity[]) { this._entities.next(val); }

  get entityPrototypes(): EntityPrototype[] { return this._entityPrototypes.getValue(); }
  set entityPrototypes(val: EntityPrototype[]) { this._entityPrototypes.next(val); }

  get attachmentPrototypes(): AttachmentPrototype[] { return this._attachmentPrototypes.getValue(); }
  set attachmentPrototypes(val: AttachmentPrototype[]) { this._attachmentPrototypes.next(val); }
}

@Injectable({providedIn: 'root'})
export class EntityState {
  private readonly _entity = new BehaviorSubject<Entity>(null);
  private readonly _prototype = new BehaviorSubject<EntityPrototype>(null);
  private readonly _attachments = new BehaviorSubject<Attachment[]>([]);
  readonly entity$ = this._entity.asObservable();
  readonly prototype$ = this._prototype.asObservable();
  readonly attachments$ = this._attachments.asObservable();

  get entity(): Entity { return this._entity.getValue(); }
  set entity(val: Entity) { this._entity.next(val); }

  get prototype(): EntityPrototype { return this._prototype.getValue(); }
  set prototype(val: EntityPrototype) { this._prototype.next(val); }

  get attachments(): Attachment[] { return this._attachments.getValue(); }
  set attachments(val: Attachment[]) { this._attachments.next(val); }
}

@Injectable({providedIn: 'root'})
export class AttachmentState {
  private readonly _attachment = new BehaviorSubject<Attachment>(null);
  readonly attachment$ = this._attachment.asObservable();

  get attachment(): Attachment { return this._attachment.getValue(); }
  set attachment(val: Attachment) { this._attachment.next(val); }
}


@Injectable({providedIn: 'root'})
export class RouteState {
  private readonly _mode = new BehaviorSubject<string>('');
  private readonly _route = new BehaviorSubject<string>('');
  private readonly _processing = new BehaviorSubject<boolean>(false);
  private readonly _saving = new BehaviorSubject<boolean>(false);

  readonly mode$ = this._mode.asObservable();
  readonly route$ = this._route.asObservable();
  readonly processing$ = this._processing.asObservable();
  readonly saving$ = this._saving.asObservable();

  get mode(): string { return this._mode.getValue(); }
  set mode(val: string) { this._mode.next(val); }

  get route(): string { return this._route.getValue(); }
  set route(val: string) { this._route.next(val); }

  get processing(): boolean { return this._processing.getValue(); }
  set processing(val: boolean) { this._processing.next(val); }

  get saving(): boolean { return this._saving.getValue(); }
  set saving(val: boolean) { this._saving.next(val); }
}
