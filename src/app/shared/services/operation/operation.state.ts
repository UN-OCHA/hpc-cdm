import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Attachment, Entity, EntityPrototype } from './operation.models';

@Injectable({providedIn: 'root'})
export class OperationState {
  private readonly _attachments = new BehaviorSubject<Attachment[]>([]);
  private readonly _entities = new BehaviorSubject<Entity[]>([]);
  private readonly _entityPrototypes = new BehaviorSubject<EntityPrototype[]>([]);
  readonly attachments$ = this._attachments.asObservable();
  readonly entities$ = this._entities.asObservable();
  readonly entityPrototypes$ = this._entityPrototypes.asObservable();

  get attachments(): Attachment[] { return this._attachments.getValue(); }
  set attachments(val: Attachment[]) { this._attachments.next(val); }

  get entities(): Entity[] { return this._entities.getValue(); }
  set entities(val: Entity[]) { this._entities.next(val); }

  get entityPrototypes(): EntityPrototype[] { return this._entityPrototypes.getValue(); }
  set entityPrototypes(val: EntityPrototype[]) { this._entityPrototypes.next(val); }
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
